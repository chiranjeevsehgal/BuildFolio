const multer = require('multer');
const axios = require('axios');
const { geminiKeyManager } = require('../utils/GeminiKeyManager');
const Job = require('../models/JobTracker');

// Configure multer for file upload (same as resume controller)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
        }
    }
});

// System prompts for different AI features
const AI_PROMPTS = {
    resumeTips: `You are an expert resume optimization consultant. Analyze the provided resume against the specific job description and provide actionable improvement suggestions.

    Return ONLY a valid JSON object with this exact structure:
    {
      "tips": [
        {
          "category": "skills|experience|keywords|format|content",
          "suggestion": "specific actionable tip",
          "priority": "high|medium|low",
          "explanation": "why this improvement matters for this specific job"
        }
      ],
      "overallScore": 85,
      "summary": "brief summary of resume strengths and areas for improvement"
    }

    Focus on:
    1. Missing keywords from job description
    2. Skills alignment with job requirements
    3. Experience relevance and presentation
    4. Resume format and structure improvements
    5. Quantifiable achievements suggestions
    6. ATS optimization tips

    Provide 5-8 specific, actionable tips. Return ONLY the JSON object.`,

    jobMatching: `You are a job matching expert. Analyze how well the candidate's resume aligns with the job requirements.

    Return ONLY a valid JSON object with this exact structure:
    {
      "overallMatch": 78,
      "skillsMatch": {
        "score": 75,
        "matchedSkills": ["React", "JavaScript", "CSS"],
        "missingSkills": ["TypeScript", "Node.js", "Docker"],
        "partialMatches": ["Frontend Development", "UI/UX"]
      },
      "experienceMatch": {
        "score": 80,
        "relevantExperience": "3 years in frontend development",
        "levelMatch": "good", 
        "gaps": ["No backend experience", "Limited cloud experience"]
      },
      "recommendations": [
        "Consider learning TypeScript to improve technical fit",
        "Highlight your CSS and responsive design experience",
        "Add more details about your frontend architecture experience"
      ],
      "strengths": ["Strong React background", "Good UI/UX sense"],
      "weaknesses": ["Missing backend skills", "No cloud experience"]
    }

    Analyze technical skills, experience level, industry fit, and role requirements. Return ONLY the JSON object.`,

    successPrediction: `You are a recruitment success prediction expert. Analyze the probability of application success based on resume-job fit.

    Return ONLY a valid JSON object with this exact structure:
    {
      "successScore": 72,
      "confidence": "medium",
      "factors": {
        "skillsAlignment": 78,
        "experienceLevel": 85,
        "industryFit": 60,
        "roleMatch": 70,
        "educationFit": 80,
        "locationMatch": 90
      },
      "insights": [
        "Your technical skills align well with the requirements",
        "Your experience level is appropriate for this role",
        "Consider emphasizing domain-specific experience"
      ],
      "improvementAreas": [
        "Highlight more industry-specific achievements",
        "Add relevant certifications",
        "Emphasize leadership experience"
      ],
      "competitiveAdvantages": [
        "Strong technical foundation",
        "Relevant project experience",
        "Good cultural fit indicators"
      ]
    }

    Consider market competitiveness, role requirements, and candidate fit. Return ONLY the JSON object.`
};

class AIInsightsController {
    // Analyze resume with uploaded file and job details
    static analyzeResume = async (req, res) => {
        try {
            const { jobId, analysisType } = req.body;

            // Validate analysis type
            const validAnalysisTypes = ['resumeTips', 'jobMatching', 'successPrediction'];
            if (!validAnalysisTypes.includes(analysisType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid analysis type. Must be one of: resumeTips, jobMatching, successPrediction'
                });
            }

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No resume file uploaded'
                });
            }

            // Validate job ID and get job details
            if (!jobId) {
                return res.status(400).json({
                    success: false,
                    message: 'Job ID is required'
                });
            }

            const job = await Job.findOne({ _id: jobId, userId: req.user.id });
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            const file = req.file;

            // Extract text from the uploaded resume
            let resumeText = '';
            
            try {
                if (file.mimetype === 'application/pdf') {
                    resumeText = await AIInsightsController.extractTextFromPDF(file.buffer);
                } else if (file.mimetype === 'application/msword' || 
                          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    resumeText = await AIInsightsController.extractTextFromWord(file.buffer);
                } else if (file.mimetype === 'text/plain') {
                    resumeText = file.buffer.toString('utf-8');
                } else {
                    throw new Error('Unsupported file type');
                }
            } catch (extractError) {
                console.error('Text extraction error:', extractError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to extract text from resume. Please ensure the file is not corrupted.'
                });
            }

            if (!resumeText || resumeText.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Could not extract text from the resume. Please try a different file.'
                });
            }

            // Prepare job context
            const jobContext = {
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description || '',
                requirements: job.requirements || ''
            };

            // Analyze with AI based on type
            const analysisResult = await AIInsightsController.analyzeWithGemini(
                resumeText, 
                jobContext, 
                analysisType
            );

            if (!analysisResult) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to analyze resume. Please try again.'
                });
            }

            // Return analysis result
            res.json({
                success: true,
                message: `${analysisType} analysis completed successfully`,
                data: {
                    analysisType,
                    jobId: job._id,
                    jobTitle: job.title,
                    company: job.company,
                    result: analysisResult,
                    analyzedAt: new Date()
                }
            });

        } catch (error) {
            console.error('AI analysis error:', error);
            
            // Handle specific error types
            if (error.message.includes('File too large')) {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Please upload a file smaller than 10MB.'
                });
            }
            
            if (error.message.includes('Invalid file type')) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to analyze resume. Please try again.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };

    // Analyze job description without resume (for initial insights)
    static analyzeJobDescription = async (req, res) => {
        try {
            const { jobId } = req.params;

            // Get job details
            const job = await Job.findOne({ _id: jobId, userId: req.user.id });
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            if (!job.description) {
                return res.status(400).json({
                    success: false,
                    message: 'Job description is required for analysis'
                });
            }

            // Analyze job description to extract requirements
            const jobAnalysis = await AIInsightsController.analyzeJobWithGemini(job);

            res.json({
                success: true,
                message: 'Job description analyzed successfully',
                data: {
                    jobId: job._id,
                    jobTitle: job.title,
                    company: job.company,
                    analysis: jobAnalysis,
                    analyzedAt: new Date()
                }
            });

        } catch (error) {
            console.error('Job analysis error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze job description. Please try again.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };

    // Extract text from PDF using pdf-parse
    static extractTextFromPDF = async (buffer) => {
        const pdf = require('pdf-parse');
        
        try {
            const data = await pdf(buffer);
            return data.text;
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error('Failed to parse PDF file');
        }
    };

    // Extract text from Word documents using mammoth
    static extractTextFromWord = async (buffer) => {
        const mammoth = require('mammoth');
        
        try {
            const result = await mammoth.extractRawText({ buffer: buffer });
            return result.value;
        } catch (error) {
            console.error('Word document parsing error:', error);
            throw new Error('Failed to parse Word document');
        }
    };

    // Analyze resume against job using Gemini API
    static analyzeWithGemini = async (resumeText, jobContext, analysisType) => {
        let lastError = null;
        const maxRetries = geminiKeyManager.apiKeys.length;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const GEMINI_API_KEY = geminiKeyManager.getNextApiKey();
                const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

                console.log(`AI Analysis attempt ${attempt + 1}: Using API key index ${(geminiKeyManager.getCurrentIndex() - 1 + geminiKeyManager.apiKeys.length) % geminiKeyManager.apiKeys.length}`);

                // Build context prompt
                const contextPrompt = `
JOB DETAILS:
Title: ${jobContext.title}
Company: ${jobContext.company}
Location: ${jobContext.location || 'Not specified'}
Description: ${jobContext.description}

RESUME CONTENT:
${resumeText}

${AI_PROMPTS[analysisType]}`;

                // Prepare the request payload
                const requestBody = {
                    contents: [
                        {
                            parts: [
                                {
                                    text: contextPrompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 1,
                        topP: 0.8,
                        maxOutputTokens: 4096,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                };

                // Make API call to Gemini
                const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000 // 30 second timeout
                });

                if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
                    throw new Error('Invalid response from Gemini API');
                }

                const generatedText = response.data.candidates[0].content.parts[0].text;

                // Clean and parse JSON response
                let cleanedText = generatedText.trim();
                
                // Remove markdown code blocks if present
                if (cleanedText.startsWith('```json')) {
                    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanedText.startsWith('```')) {
                    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                // Parse JSON
                let parsedData;
                try {
                    parsedData = JSON.parse(cleanedText);
                } catch (parseError) {
                    console.error('JSON parsing error:', parseError);
                    console.error('Raw response:', generatedText);
                    
                    // Try to extract JSON from the response
                    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        try {
                            parsedData = JSON.parse(jsonMatch[0]);
                        } catch (secondParseError) {
                            throw new Error('Failed to parse JSON response from Gemini');
                        }
                    } else {
                        throw new Error('No valid JSON found in Gemini response');
                    }
                }

                console.log(`AI Analysis successful with API key index ${(geminiKeyManager.getCurrentIndex() - 1 + geminiKeyManager.apiKeys.length) % geminiKeyManager.apiKeys.length}`);
                return parsedData;

            } catch (error) {
                console.error(`AI Analysis attempt ${attempt + 1} failed:`, error.message);
                lastError = error;
                
                // Log specific error details
                if (error.response) {
                    console.error('Gemini API response error:', error.response.data);
                    
                    // If it's a rate limit error, continue to next key
                    if (error.response.status === 429) {
                        console.log('Rate limit hit, trying next API key...');
                        continue;
                    }
                    
                    // If it's an authentication error, continue to next key
                    if (error.response.status === 401 || error.response.status === 403) {
                        console.log('Authentication error, trying next API key...');
                        continue;
                    }
                }
                
                // For other errors, still try the next key
                if (attempt < maxRetries - 1) {
                    console.log('Error occurred, trying next API key...');
                    continue;
                }
            }
        }
        
        // If all keys failed, throw the last error
        console.error('All API keys failed for AI analysis');
        throw new Error(`Failed to analyze with AI after trying all ${maxRetries} API keys. Last error: ${lastError?.message}`);
    };

    // Analyze job description to extract requirements
    static analyzeJobWithGemini = async (job) => {
        const jobAnalysisPrompt = `Analyze this job posting and extract key information for candidate matching.

Return ONLY a valid JSON object with this exact structure:
{
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "preferredSkills": ["skill1", "skill2"],
  "experienceLevel": "entry|mid|senior|lead",
  "industryType": "tech|finance|healthcare|etc",
  "roleType": "frontend|backend|fullstack|mobile|devops|etc",
  "keyResponsibilities": ["responsibility1", "responsibility2"],
  "qualifications": ["qualification1", "qualification2"],
  "difficulty": "low|medium|high",
  "competitiveLevel": "low|medium|high"
}

Job Details:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description || ''}

Extract and categorize the requirements accurately. Return ONLY the JSON object.`;

        // Use similar API calling pattern as above
        let lastError = null;
        const maxRetries = geminiKeyManager.apiKeys.length;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const GEMINI_API_KEY = geminiKeyManager.getNextApiKey();
                const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

                const requestBody = {
                    contents: [{ parts: [{ text: jobAnalysisPrompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        topK: 1,
                        topP: 0.8,
                        maxOutputTokens: 2048,
                    }
                };

                const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestBody, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                });

                if (!response.data?.candidates?.[0]) {
                    throw new Error('Invalid response from Gemini API');
                }

                const generatedText = response.data.candidates[0].content.parts[0].text;
                let cleanedText = generatedText.trim();
                
                if (cleanedText.startsWith('```json')) {
                    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanedText.startsWith('```')) {
                    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                return JSON.parse(cleanedText);

            } catch (error) {
                lastError = error;
                if (attempt < maxRetries - 1) continue;
            }
        }
        
        throw new Error(`Failed to analyze job description: ${lastError?.message}`);
    };
}

module.exports = {
    AIInsightsController,
    uploadMiddleware: upload.single('resume')
};