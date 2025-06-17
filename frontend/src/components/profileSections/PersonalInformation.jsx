import { useState, useEffect, useRef } from "react"
import {
    Edit3,
    Save,
    Camera,
    Phone,
    MapPin,
    Linkedin,
    Github,
    Loader2,
    Info,
} from "lucide-react"

const PersonalInfoSection = ({
    profileData,
    updateProfileData,
    updateSocialLinks,
    profilePhoto,
    setProfilePhoto,
    setProfileData,
    handlePhotoUpload,
    uploadingPhoto,
    editingSections,
    toggleSectionEdit,
    savePersonalProfile,
    isSaving,
    formsValid,
    validationErrors,
    touchedFields,
    handleFieldTouch,
}) => {
    // Store original data when edit mode starts
    const [originalData, setOriginalData] = useState(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const tooltipRef = useRef(null)
    const fileInputRef = useRef(null);

    // Helper functions
    const getFieldError = (fieldName) => {
        return validationErrors[fieldName] && touchedFields[fieldName] ? validationErrors[fieldName][0] : ""
    }

    const hasFieldError = (fieldName) => {
        return !!validationErrors[fieldName] && touchedFields[fieldName]
    }

    const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
};

    // Deep comparison function for objects
    const deepEqual = (obj1, obj2) => {
        if (obj1 === obj2) return true
        
        if (obj1 == null || obj2 == null) return false
        
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2
        
        const keys1 = Object.keys(obj1)
        const keys2 = Object.keys(obj2)
        
        if (keys1.length !== keys2.length) return false
        
        for (let key of keys1) {
            if (!keys2.includes(key)) return false
            if (!deepEqual(obj1[key], obj2[key])) return false
        }
        
        return true
    }

    // Check for changes when profileData changes
    useEffect(() => {
        if (originalData && editingSections.personalInfo) {
            const currentData = {
                phone: profileData.personalInfo.phone,
                location: profileData.personalInfo.location,
                socialLinks: {
                    linkedin: profileData.personalInfo.socialLinks.linkedin,
                    github: profileData.personalInfo.socialLinks.github
                }
            }
            
            const dataChanged = !deepEqual(originalData, currentData)
            setHasChanges(dataChanged)
        }
    }, [profileData, originalData, editingSections.personalInfo])

    // Store original data when entering edit mode
    useEffect(() => {
        if (editingSections.personalInfo && !originalData) {
            setOriginalData({
                phone: profileData.personalInfo.phone,
                location: profileData.personalInfo.location,
                socialLinks: {
                    linkedin: profileData.personalInfo.socialLinks.linkedin,
                    github: profileData.personalInfo.socialLinks.github
                }
            })
        } else if (!editingSections.personalInfo) {
            // Reset when exiting edit mode
            setOriginalData(null)
            setHasChanges(false)
            setShowTooltip(false)
        }
    }, [editingSections.personalInfo, profileData])

    // Enhanced toggle function to reset changes when canceling
    const handleToggleEdit = (sectionName) => {
        if (editingSections.personalInfo && hasChanges) {
            // If user is canceling with changes, ask for confirmation
            const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?")
            if (!confirmCancel) return
            
            // Restore original data
            if (originalData) {
                updateProfileData("personalInfo", "phone", originalData.phone)
                updateProfileData("personalInfo", "location", originalData.location)
                updateSocialLinks("linkedin", originalData.socialLinks.linkedin)
                updateSocialLinks("github", originalData.socialLinks.github)
            }
        }
        
        toggleSectionEdit(sectionName)
    }

    // Enhanced save function
    const handleSave = async () => {
        if (!hasChanges) return
        
        const success = await savePersonalProfile()
        if (success) {
            // Update original data to current data after successful save
            setOriginalData({
                phone: profileData.personalInfo.phone,
                location: profileData.personalInfo.location,
                socialLinks: {
                    linkedin: profileData.personalInfo.socialLinks.linkedin,
                    github: profileData.personalInfo.socialLinks.github
                }
            })
            setHasChanges(false)
        }
    }

    // Determine save button state
    const shouldDisableSave = isSaving || !formsValid.personal || !hasChanges
    const saveButtonText = isSaving ? "Saving..." : !hasChanges ? "No Changes" : "Save"

    // Display component for read-only sections
    const DisplayField = ({ label, value, className = "" }) => (
        <div className={`py-2 ${className}`}>
            <span className="text-sm font-medium text-slate-600">{label}:</span>
            <span className="ml-2 text-slate-800">{value || "Not provided"}</span>
        </div>
    )

    // Tooltip component
    const SaveButtonTooltip = ({ show, children }) => (
        <div className="relative inline-block">
            {children}
            {show && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap z-50">
                    <div className="relative">
                        You haven't made any changes
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-semibold text-slate-800">Personal Information</h2>
                    {editingSections.personalInfo && hasChanges && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                            <Info className="w-3 h-3" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleEdit("personalInfo")}
                        className={`flex items-center space-x-2 px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                            editingSections.personalInfo 
                                ? "bg-gray-600 text-white hover:bg-gray-700" 
                                : "bg-slate-600 text-white hover:bg-slate-700"
                        }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>{editingSections.personalInfo ? "Cancel" : "Edit"}</span>
                    </button>
                    {editingSections.personalInfo && (
                        <SaveButtonTooltip show={showTooltip && !hasChanges}>
                            <button
                                ref={tooltipRef}
                                onClick={handleSave}
                                disabled={shouldDisableSave}
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                    shouldDisableSave
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 cursor-pointer"
                                }`}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{saveButtonText}</span>
                            </button>
                        </SaveButtonTooltip>
                    )}
                </div>
            </div>

            {/* Profile Photo */}
            <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-slate-200">
                        {profilePhoto ? (
                            <img
                                src={profilePhoto || "/placeholder.svg"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Camera className="w-8 h-8 text-slate-400" />
                        )}
                        {uploadingPhoto && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    {editingSections.personalInfo && (
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                            disabled={uploadingPhoto}
                        />
                    )}
                </div>
                <div>
                    <h3 className="font-medium text-slate-800 mb-1">Profile Photo</h3>
                    <p className="text-sm text-slate-600 mb-2">Upload a professional headshot (max 5MB)</p>
                    {editingSections.personalInfo && (
                        <button 
                            className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors" 
                            onClick={handleUploadButtonClick}
                            disabled={uploadingPhoto}
                        >
                            {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                        </button>
                    )}
                </div>
            </div>

            {/* Contact Information */}
            {editingSections.personalInfo ? (
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 " />
                            <input
                                type="tel"
                                value={profileData.personalInfo.phone}
                                onChange={(e) => updateProfileData("personalInfo", "phone", e.target.value)}
                                onBlur={() => handleFieldTouch("phone")}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:!text-gray-500 ${
                                    hasFieldError("phone") ? "border-red-500" : "border-slate-300"
                                }`}
                                placeholder="9988776655"
                            />
                        </div>
                        {hasFieldError("phone") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("phone")}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={profileData.personalInfo.location}
                                onChange={(e) => updateProfileData("personalInfo", "location", e.target.value)}
                                onBlur={() => handleFieldTouch("location")}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:!text-gray-500 ${
                                    hasFieldError("location") ? "border-red-500" : "border-slate-300"
                                }`}
                                placeholder="Bangalore, India"
                            />
                        </div>
                        {hasFieldError("location") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("location")}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn</label>
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="url"
                                value={profileData.personalInfo.socialLinks.linkedin}
                                onChange={(e) => updateSocialLinks("linkedin", e.target.value)}
                                onBlur={() => handleFieldTouch("linkedin")}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:!text-gray-500 ${
                                    hasFieldError("linkedin") ? "border-red-500" : "border-slate-300"
                                }`}
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>
                        {hasFieldError("linkedin") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("linkedin")}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">GitHub</label>
                        <div className="relative">
                            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="url"
                                value={profileData.personalInfo.socialLinks.github}
                                onChange={(e) => updateSocialLinks("github", e.target.value)}
                                onBlur={() => handleFieldTouch("github")}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:!text-gray-500 ${
                                    hasFieldError("github") ? "border-red-500" : "border-slate-300"
                                }`}
                                placeholder="https://github.com/username"
                            />
                        </div>
                        {hasFieldError("github") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("github")}</span>
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    <DisplayField label="Phone" value={profileData.personalInfo.phone} />
                    <DisplayField label="Location" value={profileData.personalInfo.location} />
                    <DisplayField label="LinkedIn" value={profileData.personalInfo.socialLinks.linkedin} />
                    <DisplayField label="GitHub" value={profileData.personalInfo.socialLinks.github} />
                </div>
            )}
        </div>
    )
}

export default PersonalInfoSection