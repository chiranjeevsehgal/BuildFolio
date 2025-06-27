import { useState, useEffect, useRef, useCallback } from "react"
import {
    Edit3,
    Save,
    Plus,
    X,
    Loader2,
    Info,
    Check,
    User,
    FileText,
    Award,
} from "lucide-react"
import { useConfirmationModal } from '../ConfirmationModal';

const ProfessionalSummarySection = ({
    profileData,
    updateProfileData,
    newSkill,
    setNewSkill,
    resumeprofileData,
    setResumeProfileData,
    addSkill,
    removeSkill,
    editingSections,
    toggleSectionEdit,
    saveProfessionalProfile,
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
    const { showConfirmation, ConfirmationModal } = useConfirmationModal();

    const tooltipRef = useRef(null)
    const saveTimeoutRef = useRef(null)

    // Helper functions
    const getFieldError = (fieldName) => {
        return validationErrors[fieldName] && touchedFields[fieldName] ? validationErrors[fieldName][0] : ""
    }

    const hasFieldError = (fieldName) => {
        return !!validationErrors[fieldName] && touchedFields[fieldName]
    }

    // Deep comparison function for objects and arrays
    const deepEqual = (obj1, obj2) => {
        if (obj1 === obj2) return true

        if (obj1 == null || obj2 == null) return false

        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2

        // Handle arrays
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) return false
            for (let i = 0; i < obj1.length; i++) {
                if (!deepEqual(obj1[i], obj2[i])) return false
            }
            return true
        }

        // Handle objects
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
        title: profileData.professional.title,
        summary: profileData.professional.summary,
        skills: [...profileData.professional.skills]
    }), [profileData])

    // Check for changes when profileData changes
    useEffect(() => {
        if (originalData && editingSections.professional) {
            const currentData = getCurrentData()
            const dataChanged = !deepEqual(originalData, currentData)
            setHasChanges(dataChanged)

            // Reset save attempted flag when data changes
            if (dataChanged && saveAttempted) {
                setSaveAttempted(false)
            }
        }
        if (resumeprofileData) {
            const currentData = resumeprofileData
            const dataChanged = !deepEqual(originalData, currentData)
            setHasChanges(dataChanged)

            // Reset save attempted flag when data changes
            if (dataChanged && saveAttempted) {
                setSaveAttempted(false)
            }
        }
    }, [resumeprofileData, profileData, originalData, editingSections.professional, getCurrentData, saveAttempted])

    // Store original data when entering edit mode
    useEffect(() => {
        if (!resumeprofileData) {

            if (editingSections.professional && !originalData) {
                const currentData = getCurrentData()
                setOriginalData(currentData)
            } else if (!editingSections.professional) {
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
        }
    }, [editingSections.professional, getCurrentData])

    // Enhanced toggle function to reset changes when canceling
    const handleToggleEdit = async (sectionName) => {
        if (editingSections.professional && hasChanges) {
            // If user is canceling with changes, ask for confirmation
            await showConfirmation({
                title: "Unsaved Changes",
                message: "You have unsaved changes. Are you sure you want to cancel?",
                confirmText: "Yes, Cancel",
                cancelText: "Keep Editing",
                type: "warning"
            });

            // Restore original data
            if (originalData) {
                updateProfileData("professional", "title", originalData.title)
                updateProfileData("professional", "summary", originalData.summary)
                updateProfileData("professional", "skills", [...originalData.skills])
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
        const fieldsToValidate = ['title', 'summary', 'skills']
        fieldsToValidate.forEach(field => {
            handleFieldTouch(field)
        })

        setSaveAttempted(true)

        try {
            const success = await saveProfessionalProfile()
            if (success) {
                // Update original data to current data after successful save
                const currentData = getCurrentData()
                setOriginalData(currentData)
                setHasChanges(false)
                setLastSaveTime(new Date())
                setResumeProfileData(null)
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

    // Handle skill input change
    const handleSkillInputChange = (value) => {
        setNewSkill(value)
        // Touch skills field when user types in skill input
        handleFieldTouch('skills')
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
    const canSave = hasChanges && formsValid.professional && !isSaving
    const showSuccess = lastSaveTime && !hasChanges && !isSaving

    const getSaveButtonState = () => {
        if (isSaving) return { text: "Saving...", icon: Loader2, className: "bg-blue-500 text-white cursor-wait", disabled: true }
        if (showSuccess) return { text: "Saved", icon: Check, className: "bg-green-600 text-white cursor-default", disabled: true }
        if (!hasChanges) return { text: "No Changes", icon: Save, className: "bg-gray-300 text-gray-500 cursor-not-allowed", disabled: true }
        if (!formsValid.professional) return { text: "Fix Errors", icon: Info, className: "bg-red-500 text-white cursor-not-allowed", disabled: true }
        return { text: "Save Changes", icon: Save, className: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 cursor-pointer", disabled: false }
    }

    const saveButtonState = getSaveButtonState()

    // Enhanced display component for read-only sections with modern minimal design
    const DisplayField = ({ label, value, icon: Icon, className = "" }) => (
        <div className={`group p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 ${className}`}>
            <div className="flex items-start space-x-3">
                {Icon && <Icon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />}
                <div className="flex-1">
                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</span>
                    {value ? (
                        <p className="text-gray-900 text-sm font-medium leading-relaxed">{value}</p>
                    ) : (
                        <p className="text-gray-400 text-sm">—</p>
                    )}
                </div>
            </div>
        </div>
    )

    // Skills display component
    const SkillsDisplay = () => (
        <div className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300">
            <div className="flex items-start space-x-3">
                <Award className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Skills</span>
                    {profileData.professional.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profileData.professional.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">—</p>
                    )}
                </div>
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
                    <h2 className="text-2xl font-semibold text-slate-800">Professional Summary</h2>
                    {editingSections.professional && hasChanges && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs animate-pulse-custom">
                            <Info className="w-3 h-3" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                    {editingSections.professional && showSuccess && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs animate-fade-in">
                            <Check className="w-3 h-3" />
                            <span>Changes saved</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleEdit("professional")}
                        className={`flex items-center space-x-2 px-4 py-2 cursor-pointer rounded-lg transition-all duration-200 ${editingSections.professional
                            ? "bg-gray-600 text-white hover:bg-gray-700"
                            : "bg-slate-600 text-white hover:bg-slate-700"
                            }`}
                    >
                        {editingSections.professional ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        <span>{editingSections.professional ? "Cancel" : "Edit"}</span>
                    </button>
                    {editingSections.professional && (
                        <SaveButtonTooltip
                            show={showTooltip}
                            message={
                                !hasChanges ? "You haven't made any changes" :
                                    !formsValid.professional ? "Please fix validation errors first" :
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

            {editingSections.professional ? (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Professional Title
                        </label>
                        <input
                            type="text"
                            value={profileData.professional.title}
                            onChange={(e) => handleInputChange("professional", "title", e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${hasFieldError("title") ? "border-red-500 focus:ring-red-500" : "border-slate-300"
                                }`}
                            placeholder="e.g. Senior Software Engineer"
                        />
                        {hasFieldError("title") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("title")}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Professional Summary
                        </label>
                        <textarea
                            rows="4"
                            value={profileData.professional.summary}
                            onChange={(e) => handleInputChange("professional", "summary", e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 placeholder:text-gray-500 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${hasFieldError("summary") ? "border-red-500 focus:ring-red-500" : "border-slate-300"
                                }`}
                            placeholder="Write a brief summary of your professional background and expertise... (minimum 50 characters)"
                            maxLength="1000"
                        ></textarea>
                        <div className="flex justify-between mt-1">
                            <div>
                                {hasFieldError("summary") && (
                                    <p className="text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                        <Info className="w-3 h-3" />
                                        <span>{getFieldError("summary")}</span>
                                    </p>
                                )}
                            </div>
                            <p className="text-xs text-slate-500">{profileData.professional.summary.length}/1000 characters</p>
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Skills (minimum 3)
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {profileData.professional.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 transition-all duration-200 hover:bg-blue-100"
                                >
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(index)}
                                        className="ml-2 text-blue-600 cursor-pointer hover:text-red-600 transition-colors hover:bg-red-100 rounded-full p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => handleSkillInputChange(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 placeholder:text-gray-500 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Add a skill"
                            />
                            <button
                                onClick={addSkill}
                                className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        {hasFieldError("skills") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("skills")}</span>
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <DisplayField
                        label="Professional Title"
                        value={profileData.professional.title}
                        icon={User}
                    />
                    <DisplayField
                        label="Professional Summary"
                        value={profileData.professional.summary}
                        icon={FileText}
                    />
                    <SkillsDisplay />
                </div>
            )}
            <ConfirmationModal />
        </div>
    )
}

export default ProfessionalSummarySection