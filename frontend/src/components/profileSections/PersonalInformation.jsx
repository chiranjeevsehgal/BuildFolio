import { useState, useEffect, useRef, useCallback } from "react"
import { Edit3, Save, Camera, Phone, MapPin, Linkedin, Github, Loader2, Info, X, Check, ExternalLink } from "lucide-react"

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
    const [saveAttempted, setSaveAttempted] = useState(false)
    const [lastSaveTime, setLastSaveTime] = useState(null)
    const tooltipRef = useRef(null)
    const fileInputRef = useRef(null)
    const saveTimeoutRef = useRef(null)

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
    }

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

    // Memoized function to get current data
    const getCurrentData = useCallback(() => ({
        phone: profileData.personalInfo.phone,
        location: profileData.personalInfo.location,
        socialLinks: {
            linkedin: profileData.personalInfo.socialLinks.linkedin,
            github: profileData.personalInfo.socialLinks.github
        }
    }), [profileData])

    // Check for changes when profileData changes
    useEffect(() => {
        if (originalData && editingSections.personalInfo) {
            const currentData = getCurrentData()
            const dataChanged = !deepEqual(originalData, currentData)
            setHasChanges(dataChanged)
            
            // Reset save attempted flag when data changes
            if (dataChanged && saveAttempted) {
                setSaveAttempted(false)
            }
        }
    }, [profileData, originalData, editingSections.personalInfo, getCurrentData, saveAttempted])

    // Store original data when entering edit mode
    useEffect(() => {
        if (editingSections.personalInfo && !originalData) {
            const currentData = getCurrentData()
            setOriginalData(currentData)
        } else if (!editingSections.personalInfo) {
            // Reset when exiting edit mode
            setOriginalData(null)
            setHasChanges(false)
            setShowTooltip(false)
            setSaveAttempted(false)
            setLastSaveTime(null)
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [editingSections.personalInfo, getCurrentData])

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

    // Enhanced save function with better error handling
    const handleSave = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!hasChanges || isSaving) return
        
        // Touch all fields before saving to show any validation errors
        const fieldsToValidate = ['phone', 'location', 'linkedin', 'github']
        fieldsToValidate.forEach(field => {
            handleFieldTouch(field)
        })
        
        setSaveAttempted(true)
        
        try {
            const success = await savePersonalProfile()
            if (success) {
                // Update original data to current data after successful save
                const currentData = getCurrentData()
                setOriginalData(currentData)
                setHasChanges(false)
                setLastSaveTime(new Date())
                
                // Clear save attempted after successful save
                saveTimeoutRef.current = setTimeout(() => {
                    setSaveAttempted(false)
                }, 2000)
            }
        } catch (error) {
            console.error('Save failed:', error)
            // Keep saveAttempted true to show error state
        }
    }

    // Handle input changes with validation on change
    const handleInputChange = (section, field, value) => {
        updateProfileData(section, field, value)
        // Touch field immediately when user starts typing
        handleFieldTouch(field)
    }

    // Handle social links changes with validation
    const handleSocialChange = (platform, value) => {
        updateSocialLinks(platform, value)
        // Touch field immediately when user starts typing
        handleFieldTouch(platform)
    }

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    // Determine save button state with better logic
    const canSave = hasChanges && formsValid.personal && !isSaving
    const showSuccess = lastSaveTime && !hasChanges && !isSaving
    
    const getSaveButtonState = () => {
        if (isSaving) return { text: "Saving...", icon: Loader2, className: "bg-blue-500 text-white cursor-wait", disabled: true }
        if (showSuccess) return { text: "Saved", icon: Check, className: "bg-green-600 text-white cursor-default", disabled: true }
        if (!hasChanges) return { text: "No Changes", icon: Save, className: "bg-gray-300 text-gray-500 cursor-not-allowed", disabled: true }
        if (!formsValid.personal) return { text: "Fix Errors", icon: Info, className: "bg-red-500 text-white cursor-not-allowed", disabled: true }
        return { text: "Save Changes", icon: Save, className: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 cursor-pointer", disabled: false }
    }

    const saveButtonState = getSaveButtonState()

    // Enhanced display component for read-only sections with modern minimal design
    const DisplayField = ({ label, value, icon: Icon, isLink = false, className = "" }) => (
        <div className={`group p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
                    </div>
                    {value ? (
                        isLink ? (
                            <button
                                onClick={() => window.open(value, '_blank')}
                                className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors text-sm font-medium underline decoration-1 underline-offset-2 hover:decoration-2"
                            >
                                {value}
                            </button>
                        ) : (
                            <p className="text-gray-900 text-sm font-medium">{value}</p>
                        )
                    ) : (
                        <p className="text-gray-400 text-sm">—</p>
                    )}
                </div>
                {isLink && value && (
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors ml-3 mt-1 flex-shrink-0" />
                )}
            </div>
        </div>
    )

    // Enhanced tooltip component
    const SaveButtonTooltip = ({ show, children, message = "You haven't made any changes" }) => (
        <div className="relative inline-block">
            {children}
            {show && (
                <div 
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap z-50"
                    style={{
                        animation: 'fadeIn 0.2s ease-out',
                        opacity: 1,
                        transform: 'translate(-50%, 0)'
                    }}
                >
                    <div className="relative">
                        {message}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                </div>
            )}
        </div>
    )

    // Auto-hide tooltip logic
    const handleTooltipEnter = () => {
        if (!canSave) {
            setShowTooltip(true)
        }
    }

    const handleTooltipLeave = () => {
        setShowTooltip(false)
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            {/* Inline styles for animations */}
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fadeIn 0.2s ease-out;
                    }
                    .animate-slide-down {
                        animation: slideDown 0.15s ease-out;
                    }
                    .animate-pulse-custom {
                        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: .8; }
                    }
                `}
            </style>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-semibold text-slate-800">Personal Information</h2>
                    {editingSections.personalInfo && hasChanges && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs animate-pulse-custom">
                            <Info className="w-3 h-3" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                    {editingSections.personalInfo && showSuccess && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs animate-fade-in">
                            <Check className="w-3 h-3" />
                            <span>Changes saved</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleEdit("personalInfo")}
                        className={`flex items-center space-x-2 px-4 py-2 cursor-pointer rounded-lg transition-all duration-200 ${
                            editingSections.personalInfo 
                                ? "bg-gray-600 text-white hover:bg-gray-700" 
                                : "bg-slate-600 text-white hover:bg-slate-700"
                        }`}
                    >
                        {editingSections.personalInfo ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        <span>{editingSections.personalInfo ? "Cancel" : "Edit"}</span>
                    </button>
                    {editingSections.personalInfo && (
                        <SaveButtonTooltip 
                            show={showTooltip} 
                            message={
                                !hasChanges ? "You haven't made any changes" :
                                !formsValid.personal ? "Please fix validation errors first" :
                                "Ready to save your changes"
                            }
                        >
                            <button
                                ref={tooltipRef}
                                onClick={handleSave}
                                disabled={saveButtonState.disabled}
                                onMouseEnter={handleTooltipEnter}
                                onMouseLeave={handleTooltipLeave}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${saveButtonState.className}`}
                            >
                                {saveButtonState.icon === Loader2 ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : saveButtonState.icon === Check ? (
                                    <Check className="w-4 h-4" style={{ animation: 'bounce 0.6s ease-in-out' }} />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{saveButtonState.text}</span>
                            </button>
                        </SaveButtonTooltip>
                    )}
                </div>
            </div>

            {/* Profile Photo */}
            <div className="flex items-center space-x-6 mb-8">
                <div className="relative group">
                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-slate-200 transition-all duration-200 group-hover:ring-blue-300">
                        {profilePhoto ? (
                            <img
                                src={profilePhoto || "/placeholder.svg"}
                                alt="Profile"
                                className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
                            />
                        ) : (
                            <Camera className="w-8 h-8 text-slate-400 transition-colors group-hover:text-blue-500" />
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
                            className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
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
                            Phone
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="tel"
                                value={profileData.personalInfo.phone}
                                onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-500 ${
                                    hasFieldError("phone") ? "border-red-500 focus:ring-red-500" : "border-slate-300"
                                }`}
                                placeholder="9988776655"
                            />
                        </div>
                        {hasFieldError("phone") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("phone")}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Location
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={profileData.personalInfo.location}
                                onChange={(e) => handleInputChange("personalInfo", "location", e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-500 ${
                                    hasFieldError("location") ? "border-red-500 focus:ring-red-500" : "border-slate-300"
                                }`}
                                placeholder="Bangalore, India"
                            />
                        </div>
                        {hasFieldError("location") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
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
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-500 ${
                                    hasFieldError("linkedin") ? "border-red-500 focus:ring-red-500" : "border-slate-300"
                                }`}
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>
                        {hasFieldError("linkedin") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
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
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-500 ${
                                    hasFieldError("github") ? "border-red-500 focus:ring-red-500" : "border-slate-300"
                                }`}
                                placeholder="https://github.com/username"
                            />
                        </div>
                        {hasFieldError("github") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("github")}</span>
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    <DisplayField 
                        label="Phone" 
                        value={profileData.personalInfo.phone} 
                        icon={Phone}
                    />
                    <DisplayField 
                        label="Location" 
                        value={profileData.personalInfo.location} 
                        icon={MapPin}
                    />
                    <DisplayField 
                        label="LinkedIn" 
                        value={profileData.personalInfo.socialLinks.linkedin} 
                        icon={Linkedin}
                        isLink={true}
                    />
                    <DisplayField 
                        label="GitHub" 
                        value={profileData.personalInfo.socialLinks.github} 
                        icon={Github}
                        isLink={true}
                    />
                </div>
            )}
        </div>
    )
}

export default PersonalInfoSection