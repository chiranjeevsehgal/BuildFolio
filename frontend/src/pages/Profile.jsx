import { useState, useEffect, useCallback } from "react"
import {
    ArrowRight,
    AlertCircle,
    CheckCircle,
    Loader2,
} from "lucide-react"

import axios from "axios"
import Navbar from "../components/Navbar"
import { formatDateForInput } from "../utils/helperFunctions"
import PersonalInfoSection from "../components/profileSections/PersonalInformation"
import ProfessionalSummarySection from "../components/profileSections/ProfessionalSummary"
import ExperienceSection from "../components/profileSections/ExperienceSection"
import EducationSection from "../components/profileSections/EducationSection"
import ProjectsSection from "../components/profileSections/ProjectsSection"

import {
    validateCompleteProfile,
    calculateCompletionPercentage,
    checkSectionValidity,
    ValidationError
} from "../utils/profileValidation"
import Toast from "../components/Toast"

const Profile = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState({ type: "", content: "" })
    const [profilePhoto, setProfilePhoto] = useState(null)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const [touchedFields, setTouchedFields] = useState({})
    const [isFormValid, setIsFormValid] = useState(true)

    const [editingSections, setEditingSections] = useState({
        personalInfo: false,
        professional: false,
        experience: false,
        education: false,
        projects: false,
    })

    const [formsValid, setFormsValid] = useState({
        personal: true,
        professional: true,
        experience: true,
        education: true,
        projects: true,
    })

    const [profileData, setProfileData] = useState({
        personalInfo: {
            phone: "",
            location: "",
            socialLinks: {
                linkedin: "",
                github: "",
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
    })

    const [newSkill, setNewSkill] = useState("")
    const [completionPercentage, setCompletionPercentage] = useState(0)
    const API_BASE_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        console.log(validationErrors);

    }, [validationErrors])

    // Enhanced validation with debouncing
    const validateProfile = useCallback(() => {
        try {
            const validation = validateCompleteProfile(profileData)
            const sectionValidity = checkSectionValidity(validation.sectionValidation)

            setValidationErrors(validation.errors)
            setIsFormValid(validation.isValid)
            setFormsValid(sectionValidity)

            // Update completion percentage to match backend calculation
            const newCompletion = calculateCompletionPercentage(profileData)
            setCompletionPercentage(newCompletion)

            return validation
        } catch (error) {
            console.error('Validation error:', error)
            showMessage('error', 'Validation error occurred. Please refresh the page.')
            return { isValid: false, errors: {} }
        }
    }, [profileData])

    // Debounced validation effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            validateProfile()
        }, 300) // 300ms debounce

        return () => clearTimeout(timeoutId)
    }, [validateProfile])

    // Enhanced message handling with auto-dismiss and type safety
    const showMessage = useCallback((type, content, autoDismiss = true) => {
        const validTypes = ['success', 'error', 'warning', 'info']
        if (!validTypes.includes(type)) {
            console.warn(`Invalid message type: ${type}`)
            type = 'info'
        }

        setMessage({ type, content })

        if (autoDismiss) {
            setTimeout(() => {
                setMessage({ type: "", content: "" })
            }, type === 'success' ? 4000 : 6000) // Slightly longer for better readability
        }
    }, [])

    // Enhanced field touch handling
    const handleFieldTouch = useCallback((fieldName) => {
        setTouchedFields((prev) => ({
            ...prev,
            [fieldName]: true,
        }))
    }, [])

    // Toggle section editing
    const toggleSectionEdit = useCallback((sectionName) => {
        setEditingSections((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName],
        }))
    }, [])

    // Error handling utility
    const handleApiError = useCallback((error, context = '') => {
        console.error(`${context} error:`, error)

        let errorMessage = 'An unexpected error occurred. Please try again.'

        if (error.response?.status === 401) {
            errorMessage = 'Session expired. Please log in again.'
            // Redirect to login after a delay
            setTimeout(() => {
                window.location.href = '/login'
            }, 2000)
        } else if (error.response?.status === 403) {
            errorMessage = 'You do not have permission to perform this action.'
        } else if (error.response?.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.'
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message
        } else if (error.response?.data?.errors?.[0]?.msg) {
            errorMessage = error.response.data.errors[0].msg
        } else if (!navigator.onLine) {
            errorMessage = 'No internet connection. Please check your network and try again.'
        }

        showMessage('error', errorMessage, false)
    }, [showMessage])

    // Setting up axios defaults with enhanced error handling
    useEffect(() => {
        axios.defaults.baseURL = API_BASE_URL
        axios.defaults.headers.common["Content-Type"] = "application/json"
        axios.defaults.timeout = 30000 // 30 second timeout

        const token = localStorage.getItem("authToken")
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        }

        // Add response interceptor for global error handling
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.code === 'ECONNABORTED') {
                    showMessage('error', 'Request timed out. Please try again.')
                }
                return Promise.reject(error)
            }
        )

        loadProfile()

        // Cleanup interceptor
        return () => {
            axios.interceptors.response.eject(interceptor)
        }
    }, [API_BASE_URL, showMessage])

    // Enhanced profile loading with better error handling
    const loadProfile = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/profiles/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.success && data.profile) {
                const profile = data.profile

                setProfileData({
                    personalInfo: {
                        phone: profile.phone || "",
                        location: profile.location || "",
                        website: profile.website || "",
                        socialLinks: profile.socialLinks || { linkedin: "", github: "" },
                    },
                    professional: {
                        title: profile.title || "",
                        summary: profile.summary || "",
                        skills: profile.skills || [],
                    },
                    experience: (profile.experience || []).map((exp) => ({
                        ...exp,
                        startDate: formatDateForInput(exp.startDate),
                        endDate: formatDateForInput(exp.endDate),
                    })),
                    education: (profile.education || []).map((edu) => ({
                        ...edu,
                        startDate: formatDateForInput(edu.startDate),
                        endDate: formatDateForInput(edu.endDate),
                    })),
                    projects: profile.projects || [],
                    certifications: profile.certifications || [],
                })

                setProfilePhoto(profile.profilePhoto)
                setCompletionPercentage(profile.completionPercentage || 0)
            } else {
                throw new Error(data.message || "Invalid response format")
            }
        } catch (error) {
            handleApiError(error, 'Load profile')
        } finally {
            setIsLoading(false)
        }
    }

    // Enhanced photo upload with validation
    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        // Enhanced file validation
        const maxSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']

        if (file.size > maxSize) {
            showMessage('error', 'Image size must be less than 5MB')
            return
        }

        if (!allowedTypes.includes(file.type)) {
            showMessage('error', 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
            return
        }

        setUploadingPhoto(true)

        try {
            const formData = new FormData()
            formData.append('profilePhoto', file)

            const response = await axios.post('/profiles/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (response.data.success) {
                setProfilePhoto(response.data.photoUrl)
                showMessage('success', 'Profile photo updated successfully!')
            }
        } catch (error) {
            handleApiError(error, 'Photo upload')
        } finally {
            setUploadingPhoto(false)
        }
    }

    // Generic save function with validation
    const saveSection = async (sectionName, payload, successMessage) => {
        // Validate before saving
        const validation = validateProfile()
        if (!validation.sectionValidation[sectionName]?.isValid &&
            validation.sectionValidation[sectionName]?.hasData) {
            showMessage('error', 'Please fix validation errors before saving')
            return false
        }

        setIsSaving(true)

        try {
            const response = await axios.put("/profiles/me", payload)

            if (response.data.success) {
                setCompletionPercentage(response.data.profile.completionPercentage || calculateCompletionPercentage(profileData))
                showMessage('success', successMessage)

                // Close editing mode
                setEditingSections(prev => ({ ...prev, [sectionName]: false }))
                return true
            }
        } catch (error) {
            handleApiError(error, `Save ${sectionName}`)
            return false
        } finally {
            setIsSaving(false)
        }
    }

    // Enhanced save functions
    const savePersonalProfile = () => saveSection('personalInfo', {
        phone: profileData.personalInfo.phone,
        location: profileData.personalInfo.location,
        socialLinks: profileData.personalInfo.socialLinks,
    }, 'Personal information saved successfully!')

    const saveProfessionalProfile = () => saveSection('professional', {
        title: profileData.professional.title,
        summary: profileData.professional.summary,
        skills: profileData.professional.skills,
    }, 'Professional information saved successfully!')

    const saveExperienceProfile = () => {
        // Filter out incomplete experiences before saving
        const validExperiences = profileData.experience.filter(exp => {
            return exp.title && exp.title.trim() !== "" &&
                exp.company && exp.company.trim() !== "" &&
                exp.startDate && exp.startDate.trim() !== ""
        })

        // Check if we have any valid experiences to save
        if (validExperiences.length === 0) {
            showMessage('error', 'Please complete at least one experience with all required fields before saving.')
            return false
        }

        // Update profileData with filtered experiences before saving
        const originalExperiences = profileData.experience
        setProfileData(prev => ({
            ...prev,
            experience: validExperiences
        }))

        const result = saveSection('experience', {
            experience: validExperiences
        }, 'Work experience saved successfully!')

        // If save fails, restore original data
        if (!result) {
            setProfileData(prev => ({
                ...prev,
                experience: originalExperiences
            }))
        }

        return result
    }

    const saveEducationProfile = () => {
        // Filter out incomplete educations before saving
        const validEducations = profileData.education.filter(edu => {
            return edu.degree && edu.degree.trim() !== "" &&
                edu.school && edu.school.trim() !== "" &&
                edu.startDate && edu.startDate.trim() !== "" &&
                edu.endDate && edu.endDate.trim() !== ""
        })

        // Check if we have any valid educations to save
        if (validEducations.length === 0) {
            showMessage('error', 'Please complete at least one education with all required fields before saving.')
            return false
        }

        // Update profileData with filtered educations before saving
        const originalEducations = profileData.education
        setProfileData(prev => ({
            ...prev,
            education: validEducations
        }))

        // Call the generic save function with filtered data
        const result = saveSection('education', {
            education: validEducations
        }, 'Education information saved successfully!')

        // If save fails, restore original data
        if (!result) {
            setProfileData(prev => ({
                ...prev,
                education: originalEducations
            }))
        }

        return result
    }

    const saveProjectProfile = () => {
    // Filter out incomplete projects before saving
    const validProjects = profileData.projects.filter(project => {
        return project.title && project.title.trim() !== "" 
    }).map(project => {
        // Remove temporary skill field before saving
        const { skill, ...projectToSave } = project
        return projectToSave
    })

    // Check if we have any valid projects to save
    if (validProjects.length === 0) {
        showMessage('error', 'Please complete at least one project with all required fields before saving.')
        return false
    }

    // Update profileData with filtered projects before saving
    const originalProjects = profileData.projects
    setProfileData(prev => ({
        ...prev,
        projects: validProjects
    }))

    // Call the generic save function with filtered data
    const result = saveSection('projects', {
        projects: validProjects
    }, 'Projects saved successfully!')

    // If save fails, restore original data
    if (!result) {
        setProfileData(prev => ({
            ...prev,
            projects: originalProjects
        }))
    }

    return result
}

    // Enhanced continue handler with comprehensive validation
    const handleContinue = async () => {
        // Validate completion percentage
        if (completionPercentage < 60) {
            showMessage('warning', 'Please complete at least 60% of your profile before continuing', false)
            return
        }

        // Validate form
        const validation = validateProfile()
        if (!validation.isValid) {
            showMessage('error', `Please fix ${Object.keys(validation.errors).length} validation error(s) before continuing`, false)
            return
        }

        setIsSaving(true)

        try {
            // Save all profile data
            const payload = {
                phone: profileData.personalInfo.phone,
                location: profileData.personalInfo.location,
                socialLinks: profileData.personalInfo.socialLinks,
                title: profileData.professional.title,
                summary: profileData.professional.summary,
                skills: profileData.professional.skills,
                experience: profileData.experience,
                education: profileData.education,
                projects: profileData.projects,
                certifications: profileData.certifications,
            }

            const saveResponse = await axios.put("/profiles/me", payload)

            if (!saveResponse.data.success) {
                throw new Error('Failed to save profile')
            }

            // Mark profile as completed
            const completeResponse = await axios.patch('/auth/profile/complete', {
                isProfileCompleted: true
            })

            if (completeResponse.data.success) {
                showMessage('success', 'Profile completed successfully! Redirecting to templates...')

                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = "/templates"
                }, 1500)
            }
        } catch (error) {
            handleApiError(error, 'Profile completion')
        } finally {
            setIsSaving(false)
        }
    }

    // Helper function to get field errors
    const getFieldError = useCallback((fieldName) => {
        return validationErrors[fieldName] && touchedFields[fieldName] ? validationErrors[fieldName][0] : ""
    }, [validationErrors, touchedFields])

    const hasFieldError = useCallback((fieldName) => {
        return !!validationErrors[fieldName] && touchedFields[fieldName]
    }, [validationErrors, touchedFields])

    // Enhanced loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading your profile...</p>
                    <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
                </div>
            </div>
        )
    }

    const updateProfileData = (section, field, value) => {
        setProfileData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }))
    }

    const updateSocialLinks = (platform, value) => {
        setProfileData((prev) => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                socialLinks: {
                    ...prev.personalInfo.socialLinks,
                    [platform]: value,
                },
            },
        }))
    }

    const addSkill = () => {
        if (newSkill.trim() && !profileData.professional.skills.includes(newSkill.trim())) {
            setProfileData((prev) => ({
                ...prev,
                professional: {
                    ...prev.professional,
                    skills: [...prev.professional.skills, newSkill.trim()],
                },
            }))
            setNewSkill("")
        }
    }

    const removeSkill = (index) => {
        setProfileData((prev) => ({
            ...prev,
            professional: {
                ...prev.professional,
                skills: prev.professional.skills.filter((_, i) => i !== index),
            },
        }))
    }

    const removeProject = (index) => {
        setProfileData((prev) => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index),
        }))
    }

    const updateProject = (index, field, value) => {
        setProfileData((prev) => ({
            ...prev,
            projects: prev.projects.map((proj, i) => (i === index ? { ...proj, [field]: value } : proj)),
        }))
    }

    const removeProjectSkill = (projectIndex, skillIndex) => {
        const updatedProjects = [...profileData.projects]
        updatedProjects[projectIndex].skills = updatedProjects[projectIndex].skills.filter((_, i) => i !== skillIndex)
        setProfileData((prev) => ({
            ...prev,
            projects: updatedProjects,
        }))
    }

    const addProjectSkill = (projectIndex) => {
        const skillToAdd = profileData.projects[projectIndex].skill

        if (skillToAdd && skillToAdd.trim()) {
            const updatedProjects = [...profileData.projects]
            updatedProjects[projectIndex].skills = [...(updatedProjects[projectIndex].skills || []), skillToAdd.trim()]
            updatedProjects[projectIndex].skill = ""
            setProfileData((prev) => ({
                ...prev,
                projects: updatedProjects,
            }))
        }
    }

    const addExperience = () => {
        const newExp = {
            title: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
        }
        setProfileData((prev) => ({
            ...prev,
            experience: [...prev.experience, newExp],
        }))
        setEditingSections((prev) => ({ ...prev, experience: true }))
    }

    const updateExperience = (index, field, value) => {
        setProfileData((prev) => ({
            ...prev,
            experience: prev.experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
        }))
    }

    const removeExperience = (index) => {
        setProfileData((prev) => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index),
        }))
    }

    return (
        <>
            <Navbar current="/profile" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                            Build Your Professional Profile
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4">
                            Add your information to create your portfolio
                        </p>

                        {/* Enhanced Completion Progress */}
                        <div className="max-w-md mx-auto">
                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                                <span>Profile Completion</span>
                                <span className={`font-semibold ${completionPercentage >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
                                    {completionPercentage}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                                <div
                                    className={`h-3 rounded-full transition-all duration-700 ease-out ${completionPercentage >= 60
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                        }`}
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {completionPercentage >= 60
                                    ? 'Great! You can proceed to templates'
                                    : 'Complete at least 60% to proceed'}
                            </p>
                        </div>
                    </div>

                    {/* Enhanced Message Display */}
                    <Toast
                        message={message}
                        onClose={() => setMessage({ type: "", content: "" })}
                    />

                    {/* Profile Form */}
                    <div className="space-y-8">
                        {/* Personal Information */}
                        <PersonalInfoSection
                            profileData={profileData}
                            updateProfileData={updateProfileData}
                            setProfileData={setProfileData}
                            updateSocialLinks={updateSocialLinks}
                            profilePhoto={profilePhoto}
                            setProfilePhoto={setProfilePhoto}
                            handlePhotoUpload={handlePhotoUpload}
                            uploadingPhoto={uploadingPhoto}
                            editingSections={editingSections}
                            toggleSectionEdit={toggleSectionEdit}
                            savePersonalProfile={savePersonalProfile}
                            isSaving={isSaving}
                            formsValid={formsValid}
                            validationErrors={validationErrors}
                            touchedFields={touchedFields}
                            handleFieldTouch={handleFieldTouch}
                            getFieldError={getFieldError}
                            hasFieldError={hasFieldError}
                        />

                        {/* Professional Summary */}
                        <ProfessionalSummarySection
                            profileData={profileData}
                            updateProfileData={updateProfileData}
                            newSkill={newSkill}
                            setNewSkill={setNewSkill}
                            addSkill={addSkill}
                            removeSkill={removeSkill}
                            editingSections={editingSections}
                            toggleSectionEdit={toggleSectionEdit}
                            saveProfessionalProfile={saveProfessionalProfile}
                            isSaving={isSaving}
                            formsValid={formsValid}
                            validationErrors={validationErrors}
                            touchedFields={touchedFields}
                            handleFieldTouch={handleFieldTouch}
                            getFieldError={getFieldError}
                            hasFieldError={hasFieldError}
                        />

                        {/* Experience Section */}
                        <ExperienceSection
                            profileData={profileData}
                            updateExperience={updateExperience}
                            addExperience={addExperience}
                            removeExperience={removeExperience}
                            editingSections={editingSections}
                            toggleSectionEdit={toggleSectionEdit}
                            saveExperienceProfile={saveExperienceProfile}
                            isSaving={isSaving}
                            formsValid={formsValid}
                            validationErrors={validationErrors}
                            touchedFields={touchedFields}
                            handleFieldTouch={handleFieldTouch}
                            getFieldError={getFieldError}
                            hasFieldError={hasFieldError}
                        />

                        {/* Education Section */}
                        <EducationSection
                            profileData={profileData}
                            setProfileData={setProfileData}
                            editingSections={editingSections}
                            toggleSectionEdit={toggleSectionEdit}
                            showMessage={showMessage}
                            saveEducationProfile={saveEducationProfile}
                            isSaving={isSaving}
                            formsValid={formsValid}
                            validationErrors={validationErrors}
                            touchedFields={touchedFields}
                            handleFieldTouch={handleFieldTouch}
                            getFieldError={getFieldError}
                            hasFieldError={hasFieldError}
                        />

                        {/* Projects Section */}
                        <ProjectsSection
                            profileData={profileData}
                            setProfileData={setProfileData}
                            updateProject={updateProject}
                            removeProject={removeProject}
                            addProjectSkill={addProjectSkill}
                            showMessage={showMessage}
                            removeProjectSkill={removeProjectSkill}
                            editingSections={editingSections}
                            toggleSectionEdit={toggleSectionEdit}
                            saveProjectProfile={saveProjectProfile}
                            isSaving={isSaving}
                            formsValid={formsValid}
                            validationErrors={validationErrors}
                            touchedFields={touchedFields}
                            handleFieldTouch={handleFieldTouch}
                            getFieldError={getFieldError}
                            hasFieldError={hasFieldError}
                        />

                        {/* Enhanced Save and Continue Button */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                                <div className="text-sm text-slate-600">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span>Profile completion:</span>
                                        <span className={`font-bold text-lg ${completionPercentage >= 60 ? 'text-green-600' : 'text-amber-600'
                                            }`}>
                                            {completionPercentage}%
                                        </span>
                                        {completionPercentage >= 60 && (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Complete at least 60% to proceed to templates
                                    </p>
                                    {!isFormValid && Object.keys(validationErrors).length > 0 && (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                            <p className="text-xs text-red-600">
                                                Please fix {Object.keys(validationErrors).length} validation error(s)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleContinue}
                                        disabled={completionPercentage < 60 || isSaving || !isFormValid}
                                        className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transform hover:scale-105 disabled:hover:scale-100"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Continue to Templates</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile;