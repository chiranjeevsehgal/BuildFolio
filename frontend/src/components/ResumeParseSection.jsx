import mammoth from 'mammoth'
import { useState } from 'react'
import Tesseract from 'tesseract.js'

const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const typedArray = new Uint8Array(e.target.result)
                const text = await extractPDFText(typedArray)
                resolve(text)
            } catch (error) {
                reject(new Error("Failed to extract text from PDF"))
            }
        }
        reader.onerror = () => reject(new Error("Failed to read PDF file"))
        reader.readAsArrayBuffer(file)
    })
}

const extractPDFText = async (buffer) => {
    throw new Error("PDF parsing requires pdf-parse library. Please install it first.")
}

const extractTextFromDOCX = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result
                const result = await mammoth.extractRawText({ arrayBuffer })
                resolve(result.value)
            } catch (error) {
                reject(new Error("Failed to extract text from DOCX"))
            }
        }
        reader.onerror = () => reject(new Error("Failed to read DOCX file"))
        reader.readAsArrayBuffer(file)
    })
}

const extractTextFromImage = async (file) => {
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            logger: m => console.log(m)
        })
        return text
    } catch (error) {
        throw new Error("Failed to extract text from image")
    }
}

const parseResumeText = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    const data = {
        personalInfo: {
            phone: "",
            location: "",
            socialLinks: { linkedin: "", github: "" }
        },
        professional: {
            title: "",
            summary: "",
            skills: []
        },
        experience: [],
        education: [],
        projects: []
    }
    
    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emails = text.match(emailRegex)
    if (emails && emails.length > 0) {
        data.personalInfo.email = emails[0]
    }
    
    // Extract phone number
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
    const phones = text.match(phoneRegex)
    if (phones && phones.length > 0) {
        data.personalInfo.phone = phones[0].replace(/\D/g, '').slice(-10)
    }
    
    // Extract LinkedIn
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/gi
    const linkedinMatches = text.match(linkedinRegex)
    if (linkedinMatches && linkedinMatches.length > 0) {
        data.personalInfo.socialLinks.linkedin = linkedinMatches[0]
    }
    
    // Extract GitHub
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/gi
    const githubMatches = text.match(githubRegex)
    if (githubMatches && githubMatches.length > 0) {
        data.personalInfo.socialLinks.github = githubMatches[0]
    }
    
    // Extract location
    const locationRegex = /([A-Za-z\s]+,\s*[A-Za-z\s]+(?:,\s*[A-Za-z\s]+)?)/g
    const locations = text.match(locationRegex)
    if (locations && locations.length > 0) {
        data.personalInfo.location = locations[0]
    }
    
    // Extract skills
    const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'SQL',
        'Git', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'Angular', 'Vue.js',
        'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API', 'Machine Learning',
        'Data Analysis', 'Project Management', 'Agile', 'Scrum', 'Leadership'
    ]
    
    const foundSkills = skillKeywords.filter(skill => 
        text.toLowerCase().includes(skill.toLowerCase())
    )
    data.professional.skills = [...new Set(foundSkills)].slice(0, 10)
    
    // Extract professional title
    const titleKeywords = ['engineer', 'developer', 'manager', 'analyst', 'designer', 'consultant', 'specialist']
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].toLowerCase()
        if (titleKeywords.some(keyword => line.includes(keyword)) && line.length < 100) {
            data.professional.title = lines[i]
            break
        }
    }
    
    // Extract experience
    const dateRegex = /\b(19|20)\d{2}\b/g
    const experienceSection = extractSection(text, ['experience', 'work history', 'employment'])
    if (experienceSection) {
        const expEntries = experienceSection.split('\n').filter(line => line.trim().length > 0)
        
        let currentExp = null
        expEntries.forEach(line => {
            const dates = line.match(dateRegex)
            if (dates && dates.length >= 1) {
                if (currentExp) {
                    data.experience.push(currentExp)
                }
                currentExp = {
                    title: "",
                    company: "",
                    location: "",
                    startDate: dates[0],
                    endDate: dates[1] || "",
                    current: false,
                    description: ""
                }
            } else if (currentExp && line.length > 0) {
                if (!currentExp.title) {
                    currentExp.title = line
                } else if (!currentExp.company) {
                    currentExp.company = line
                } else {
                    currentExp.description += line + " "
                }
            }
        })
        if (currentExp) {
            data.experience.push(currentExp)
        }
    }
    
    // Extract education
    const educationSection = extractSection(text, ['education', 'academic background', 'qualifications'])
    if (educationSection) {
        const eduEntries = educationSection.split('\n').filter(line => line.trim().length > 0)
        
        let currentEdu = null
        eduEntries.forEach(line => {
            const dates = line.match(dateRegex)
            if (dates && dates.length >= 1) {
                if (currentEdu) {
                    data.education.push(currentEdu)
                }
                currentEdu = {
                    degree: "",
                    school: "",
                    location: "",
                    startDate: dates[0],
                    endDate: dates[1] || dates[0],
                    description: ""
                }
            } else if (currentEdu && line.length > 0) {
                if (!currentEdu.degree) {
                    currentEdu.degree = line
                } else if (!currentEdu.school) {
                    currentEdu.school = line
                } else {
                    currentEdu.description += line + " "
                }
            }
        })
        if (currentEdu) {
            data.education.push(currentEdu)
        }
    }
    
    return data
}

const extractSection = (text, sectionKeywords) => {
    const lines = text.split('\n')
    let sectionStart = -1
    let sectionEnd = lines.length
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().trim()
        if (sectionKeywords.some(keyword => line.includes(keyword))) {
            sectionStart = i + 1
            break
        }
    }
    
    if (sectionStart === -1) return null
    
    const otherSections = ['experience', 'education', 'skills', 'projects', 'certifications', 'awards']
    for (let i = sectionStart; i < lines.length; i++) {
        const line = lines[i].toLowerCase().trim()
        if (otherSections.some(section => 
            line.includes(section) && !sectionKeywords.includes(section)
        )) {
            sectionEnd = i
            break
        }
    }
    
    return lines.slice(sectionStart, sectionEnd).join('\n')
}

const processResumeFile = async (file) => {
    try {
        let extractedText = ""
        
        if (file.type === "application/pdf") {
            extractedText = await extractTextFromPDF(file)
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            extractedText = await extractTextFromDOCX(file)
        } else if (file.type.startsWith("image/")) {
            extractedText = await extractTextFromImage(file)
        } else {
            throw new Error("Unsupported file format. Please upload PDF, DOCX, or image files.")
        }
        
        const parsedData = parseResumeText(extractedText)
        return parsedData
        
    } catch (error) {
        console.error("Resume processing error:", error)
        throw error
    }
}

export const ResumeImportSection = ({ onResumeProcessed, onMessage }) => {
    const [isProcessingResume, setIsProcessingResume] = useState(false)

    const handleResumeUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            onMessage?.({
                type: "error",
                content: "File size must be less than 10MB"
            })
            return
        }
        
        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ]
        
        if (!allowedTypes.includes(file.type)) {
            onMessage?.({
                type: "error",
                content: "Please upload a PDF, DOCX, or image file"
            })
            return
        }
        
        setIsProcessingResume(true)
        onMessage?.({ type: "", content: "" })
        
        try {
            const parsedData = await processResumeFile(file)
            onResumeProcessed?.(parsedData)
            onMessage?.({
                type: "success",
                content: "Resume processed successfully! Review the extracted information below."
            })
        } catch (error) {
            onMessage?.({
                type: "error",
                content: error.message || "Failed to process resume. Please try again."
            })
        } finally {
            setIsProcessingResume(false)
        }
    }

    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200 mb-8">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Import from Resume</h3>
                <p className="text-slate-600 mb-4">Upload your resume to automatically fill your profile</p>
                
                <div className="relative inline-block">
                    <input
                        type="file"
                        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                        onChange={handleResumeUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isProcessingResume}
                    />
                    <button
                        disabled={isProcessingResume}
                        className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {isProcessingResume ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-xl">+</span>
                                <span>Upload Resume</span>
                            </>
                        )}
                    </button>
                </div>
                
                <p className="text-xs text-slate-500 mt-2">
                    Supports PDF, DOCX, and image files (max 10MB)
                </p>
            </div>
        </div>
    )
}

export const ResumePreviewModal = ({ 
    isVisible, 
    resumeData, 
    onClose, 
    onApply 
}) => {
    if (!isVisible || !resumeData) return null
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-slate-800">Review Extracted Information</h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-slate-600 mt-1">Review the information below and apply to your profile</p>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Personal Info Preview */}
                    <div>
                        <h4 className="font-medium text-slate-800 mb-3">Personal Information</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div><strong>Phone:</strong> {resumeData.personalInfo.phone || "Not found"}</div>
                            <div><strong>Location:</strong> {resumeData.personalInfo.location || "Not found"}</div>
                            <div><strong>LinkedIn:</strong> {resumeData.personalInfo.socialLinks.linkedin || "Not found"}</div>
                            <div><strong>GitHub:</strong> {resumeData.personalInfo.socialLinks.github || "Not found"}</div>
                        </div>
                    </div>
                    
                    {/* Professional Info Preview */}
                    <div>
                        <h4 className="font-medium text-slate-800 mb-3">Professional Information</h4>
                        <div className="space-y-2 text-sm">
                            <div><strong>Title:</strong> {resumeData.professional.title || "Not found"}</div>
                            <div><strong>Skills Found:</strong> 
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {resumeData.professional.skills.map((skill, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Experience Preview */}
                    {resumeData.experience.length > 0 && (
                        <div>
                            <h4 className="font-medium text-slate-800 mb-3">Experience ({resumeData.experience.length} entries)</h4>
                            <div className="space-y-3">
                                {resumeData.experience.slice(0, 2).map((exp, index) => (
                                    <div key={index} className="border border-slate-200 rounded p-3 text-sm">
                                        <div><strong>Title:</strong> {exp.title}</div>
                                        <div><strong>Company:</strong> {exp.company}</div>
                                        <div><strong>Duration:</strong> {exp.startDate} - {exp.endDate || "Present"}</div>
                                    </div>
                                ))}
                                {resumeData.experience.length > 2 && (
                                    <p className="text-slate-500 text-xs">... and {resumeData.experience.length - 2} more</p>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Education Preview */}
                    {resumeData.education.length > 0 && (
                        <div>
                            <h4 className="font-medium text-slate-800 mb-3">Education ({resumeData.education.length} entries)</h4>
                            <div className="space-y-3">
                                {resumeData.education.slice(0, 2).map((edu, index) => (
                                    <div key={index} className="border border-slate-200 rounded p-3 text-sm">
                                        <div><strong>Degree:</strong> {edu.degree}</div>
                                        <div><strong>School:</strong> {edu.school}</div>
                                        <div><strong>Duration:</strong> {edu.startDate} - {edu.endDate}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-6 border-t border-slate-200 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onApply}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Apply to Profile
                    </button>
                </div>
            </div>
        </div>
    )
}