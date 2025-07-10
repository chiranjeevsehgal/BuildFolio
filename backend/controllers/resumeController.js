const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const axios = require("axios");
const FormData = require("form-data");
const { geminiKeyManager } = require("../utils/GeminiKeyManager");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.",
        ),
        false,
      );
    }
  },
});

// System prompt for Gemini
const GEMINI_SYSTEM_PROMPT = `You are a professional resume parser. Extract information from the provided resume and return ONLY a valid JSON object with the following exact structure. Do not include any additional text, explanations, or markdown formatting.

Return the data in this exact format:
{
  "personalInfo": {
    "phone": "",
    "location": "",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "portfolio": ""
    }
  },
  "professional": {
    "title": "",
    "summary": "",
    "skills": []
  },
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "school": "",
      "location": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": "",
      "relevantCoursework": []
    }
  ],
  "projects": [
    {
      "title": "",
      "description": "",
      "technologies": [],
      "githubUrl": "",
      "liveUrl": "",
      "highlights": []
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "YYYY-MM",
      "credentialId": "",
      "url": ""
    }
  ]
}

Important parsing rules:
1. Extract phone numbers, email addresses, and location information
2. Find LinkedIn, GitHub, and portfolio URLs in social links
3. Identify the main professional title/role
4. Extract professional summary or objective
5. List all technical skills, tools, and technologies
6. Parse work experience with dates in YYYY-MM format
7. Extract education details including GPA if mentioned
8. Identify projects with technologies used
9. Find certifications and their details
10. If information is not available, leave the field empty (empty string for strings, empty array for arrays, false for booleans)
11. Ensure dates are in YYYY-MM format (e.g., "2023-01", "2024-12")
12. For current positions, set "current": true and "endDate": ""
13. Extract key achievements and responsibilities in descriptions
14. Normalize company names and remove extra formatting
15. Return ONLY the JSON object, no other text

Parse the following resume content:`;

class ResumeController {
  // Upload and parse resume
  static uploadResume = async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No resume file uploaded",
        });
      }

      const file = req.file;

      // Extract text from the file based on file type
      let resumeText = "";

      try {
        if (file.mimetype === "application/pdf") {
          resumeText = await ResumeController.extractTextFromPDF(file.buffer);
        } else if (
          file.mimetype === "application/msword" ||
          file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          resumeText = await ResumeController.extractTextFromWord(file.buffer);
        } else if (file.mimetype === "text/plain") {
          resumeText = file.buffer.toString("utf-8");
        } else {
          throw new Error("Unsupported file type");
        }
      } catch (extractError) {
        console.error("Text extraction error:", extractError);
        return res.status(400).json({
          success: false,
          message:
            "Failed to extract text from resume. Please ensure the file is not corrupted.",
        });
      }

      if (!resumeText || resumeText.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Could not extract text from the resume. Please try a different file.",
        });
      }

      // Parse resume using Gemini API
      const parsedData =
        await ResumeController.parseResumeWithGemini(resumeText);

      if (!parsedData) {
        return res.status(500).json({
          success: false,
          message:
            "Failed to parse resume. Please try again or upload a different format.",
        });
      }

      // Return parsed data
      res.json({
        success: true,
        message: "Resume parsed successfully",
        data: parsedData,
      });
    } catch (error) {
      console.error("Resume upload error:", error);

      // Handle specific error types
      if (error.message.includes("File too large")) {
        return res.status(400).json({
          success: false,
          message:
            "File size too large. Please upload a file smaller than 10MB.",
        });
      }

      if (error.message.includes("Invalid file type")) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to process resume. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };

  // Extract text from PDF using pdf-parse
  static extractTextFromPDF = async (buffer) => {
    const pdf = require("pdf-parse");

    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      console.error("PDF parsing error:", error);
      throw new Error("Failed to parse PDF file");
    }
  };

  // Extract text from Word documents using mammoth
  static extractTextFromWord = async (buffer) => {
    const mammoth = require("mammoth");

    try {
      const result = await mammoth.extractRawText({ buffer: buffer });
      return result.value;
    } catch (error) {
      console.error("Word document parsing error:", error);
      throw new Error("Failed to parse Word document");
    }
  };

  // Parse resume using Gemini API
  static parseResumeWithGemini = async (resumeText) => {
    let lastError = null;
    const maxRetries = geminiKeyManager.apiKeys.length; // Try all keys once

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const GEMINI_API_KEY = geminiKeyManager.getNextApiKey();
        // gemini-2.0-flash-exp
        const GEMINI_API_URL =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        console.log(
          `Attempt ${attempt + 1}: Using API key index ${(geminiKeyManager.getCurrentIndex() - 1 + geminiKeyManager.apiKeys.length) % geminiKeyManager.apiKeys.length}`,
        );

        // Prepare the request payload
        const requestBody = {
          contents: [
            {
              parts: [
                {
                  text: `${GEMINI_SYSTEM_PROMPT}\n\n${resumeText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 4096,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        };

        // Make API call to Gemini
        const response = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 30000, // 30 second timeout
          },
        );

        if (
          !response.data ||
          !response.data.candidates ||
          !response.data.candidates[0]
        ) {
          throw new Error("Invalid response from Gemini API");
        }

        const generatedText = response.data.candidates[0].content.parts[0].text;

        // Clean and parse JSON response
        let cleanedText = generatedText.trim();

        // Remove markdown code blocks if present
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "");
        } else if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "");
        }

        // Parse JSON
        let parsedData;
        try {
          parsedData = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          console.error("Raw response:", generatedText);

          // Try to extract JSON from the response
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsedData = JSON.parse(jsonMatch[0]);
            } catch (secondParseError) {
              throw new Error("Failed to parse JSON response from Gemini");
            }
          } else {
            throw new Error("No valid JSON found in Gemini response");
          }
        }

        // Validate the structure
        const validatedData = ResumeController.validateAndCleanData(parsedData);

        console.log(
          `Successfully processed with API key index ${(geminiKeyManager.getCurrentIndex() - 1 + geminiKeyManager.apiKeys.length) % geminiKeyManager.apiKeys.length}`,
        );
        return validatedData;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
        lastError = error;

        // Log specific error details
        if (error.response) {
          console.error("Gemini API response error:", error.response.data);

          // If it's a rate limit error, continue to next key
          if (error.response.status === 429) {
            console.log("Rate limit hit, trying next API key...");
            continue;
          }

          // If it's an authentication error, continue to next key
          if (error.response.status === 401 || error.response.status === 403) {
            console.log("Authentication error, trying next API key...");
            continue;
          }
        }

        // For other errors, still try the next key in case it's key-specific
        if (attempt < maxRetries - 1) {
          console.log("Error occurred, trying next API key...");
          continue;
        }
      }
    }

    // If all keys failed, throw the last error
    console.error("All API keys failed");
    throw new Error(
      `Failed to parse resume with AI after trying all ${maxRetries} API keys. Last error: ${lastError?.message}`,
    );
  };

  // Validate and clean the parsed data
  static validateAndCleanData = (data) => {
    const defaultStructure = {
      personalInfo: {
        phone: "",
        location: "",
        socialLinks: {
          linkedin: "",
          github: "",
          portfolio: "",
        },
      },
      professional: {
        title: "",
        summary: "",
        skills: [],
      },
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    };

    // Merge with default structure to ensure all fields exist
    const mergedData = {
      personalInfo: {
        ...defaultStructure.personalInfo,
        ...data.personalInfo,
        socialLinks: {
          ...defaultStructure.personalInfo.socialLinks,
          ...data.personalInfo?.socialLinks,
        },
      },
      professional: {
        ...defaultStructure.professional,
        ...data.professional,
        skills: Array.isArray(data.professional?.skills)
          ? data.professional.skills
          : [],
      },
      experience: Array.isArray(data.experience)
        ? data.experience.map((exp) => ({
            title: exp.title || "",
            company: exp.company || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            current: Boolean(exp.current),
            description: exp.description || "",
          }))
        : [],
      education: Array.isArray(data.education)
        ? data.education.map((edu) => ({
            degree: edu.degree || "",
            school: edu.school || "",
            location: edu.location || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            gpa: edu.gpa || "",
            relevantCoursework: Array.isArray(edu.relevantCoursework)
              ? edu.relevantCoursework
              : [],
          }))
        : [],
      projects: Array.isArray(data.projects)
        ? data.projects.map((proj) => ({
            title: proj.title || "",
            description: proj.description || "",
            technologies: Array.isArray(proj.technologies)
              ? proj.technologies
              : [],
            githubUrl: proj.githubUrl || "",
            liveUrl: proj.liveUrl || "",
            highlights: Array.isArray(proj.highlights) ? proj.highlights : [],
          }))
        : [],
      certifications: Array.isArray(data.certifications)
        ? data.certifications.map((cert) => ({
            name: cert.name || "",
            issuer: cert.issuer || "",
            date: cert.date || "",
            credentialId: cert.credentialId || "",
            url: cert.url || "",
          }))
        : [],
    };

    return mergedData;
  };
}

module.exports = {
  ResumeController,
  uploadMiddleware: upload.single("resume"),
};
