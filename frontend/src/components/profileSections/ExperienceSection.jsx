import { useState, useEffect, useRef, useCallback } from "react"
import {
    Edit3,
    Save,
    Plus,
    Briefcase,
    Loader2,
    Trash2,
    Info,
    Check,
    X,
    MapPin,
    Calendar,
    Building,
} from "lucide-react"
import { LocationAutocomplete } from "./Location_UniversitySearch"
import CustomDateInput from "./CustomDateInput"
import { useConfirmationModal } from '../ConfirmationModal';

const ExperienceSection = ({
    profileData,
    updateExperience,
    addExperience,
    removeExperience,
    editingSections,
    resumeprofileData,
    setResumeProfileData,
    toggleSectionEdit,
    saveExperienceProfile,
    isSaving,
    formsValid,
    validationErrors,
    touchedFields,
    handleFieldTouch,
}) => {
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
        return validationErrors[fieldName] && (touchedFields[fieldName] || saveAttempted) ? validationErrors[fieldName][0] : ""
    }

    const hasFieldError = (fieldName) => {
        return !!validationErrors[fieldName] && (touchedFields[fieldName] || saveAttempted)
    }

    // Deep comparison function for arrays and objects
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

    // Create deep copy of experience array
    const createExperienceCopy = (experiences) => {
        return experiences.map(exp => ({
            title: exp.title || "",
            company: exp.company || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            current: exp.current || false,
            description: exp.description || ""
        }))
    }

    // Memoized function to get current data
    const getCurrentData = useCallback(() => createExperienceCopy(profileData.experience), [profileData])

    // Check for changes when profileData changes
    useEffect(() => {
        if (originalData && editingSections.experience) {
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
    }, [resumeprofileData, profileData, originalData, editingSections.experience, getCurrentData, saveAttempted])

    // Store original data when entering edit mode
    useEffect(() => {
        if (!resumeprofileData) {
            if (editingSections.experience && !originalData) {
                const currentData = getCurrentData()
                setOriginalData(currentData)
            } else if (!editingSections.experience) {
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
    }, [editingSections.experience, getCurrentData])

    // Enhanced toggle function to reset changes when canceling
    const handleToggleEdit = async (sectionName) => {
        if (editingSections.experience && hasChanges) {
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
                if (window.restoreExperienceData) {
                    window.restoreExperienceData(originalData)
                }
            }
        }

        toggleSectionEdit(sectionName)
    }

    // Function to touch all experience fields
    const touchAllFields = () => {
        profileData.experience.forEach((_, index) => {
            const fieldsToValidate = ['title', 'company', 'location', 'startDate', 'endDate', 'description']
            fieldsToValidate.forEach(field => {
                handleFieldTouch(`experience_${index}_${field}`)
            })
        })
    }

    // Enhanced save function with better error handling
    const handleSave = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (isSaving) return

        // Always touch all fields and set save attempted to show errors
        touchAllFields()
        setSaveAttempted(true)

        if (!hasChanges) {
            return
        }
        if (!formsValid.experience) {
            return
        }

        try {
            const success = await saveExperienceProfile()
            if (success) {
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
    const handleInputChange = (index, field, value) => {
        updateExperience(index, field, value)
        handleFieldTouch(`experience_${index}_${field}`)

        if (field === 'startDate') {
            handleFieldTouch(`experience_${index}_endDate`)
        } else if (field === 'endDate') {
            handleFieldTouch(`experience_${index}_startDate`)
        }
    }

    const handleAddExperience = () => {
        addExperience()
    }

    const getDateRangeError = (index) => {
        return validationErrors[`experience_${index}_dateRange`] &&
            (touchedFields[`experience_${index}_startDate`] ||
                touchedFields[`experience_${index}_endDate`] ||
                saveAttempted) ?
            validationErrors[`experience_${index}_dateRange`][0] : ""
    }

    const hasDateRangeError = (index) => {
        return !!validationErrors[`experience_${index}_dateRange`] &&
            (touchedFields[`experience_${index}_startDate`] ||
                touchedFields[`experience_${index}_endDate`] ||
                saveAttempted)
    }

    const handleRemoveExperience = async (index) => {
        await showConfirmation({
            title: "Delete Experience",
            message: "Are you sure you want to delete this experience entry? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger"
        });

        removeExperience(index)

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
    const canSave = hasChanges && formsValid.experience && !isSaving
    const showSuccess = lastSaveTime && !hasChanges && !isSaving

    const getSaveButtonState = () => {
        if (isSaving) return { text: "Saving...", icon: Loader2, className: "bg-blue-500 text-white cursor-wait", disabled: true }
        if (showSuccess) return { text: "Saved", icon: Check, className: "bg-green-600 text-white cursor-default", disabled: true }
        if (!hasChanges) return { text: "No Changes", icon: Save, className: "bg-gray-300 text-gray-500 cursor-pointer", disabled: false }
        if (!formsValid.experience) return { text: "Save Changes", icon: Save, className: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 cursor-pointer", disabled: false }
        return { text: "Save Changes", icon: Save, className: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 cursor-pointer", disabled: false }
    }

    const saveButtonState = getSaveButtonState()

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
        if (!canSave && !hasChanges) {
            setShowTooltip(true)
        }
    }

    const handleTooltipLeave = () => {
        setShowTooltip(false)
    }

    // Enhanced read-only experience card
    const ExperienceCard = ({ exp, index }) => (
        <div className="group p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {exp.title}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                                <div className="flex items-center space-x-1">
                                    <Building className="w-4 h-4" />
                                    <span>{exp.company}</span>
                                </div>
                                {exp.location && (
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{exp.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                                </div>
                            </div>
                        </div>
                        {exp.current && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                Current
                            </span>
                        )}
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm">{exp.description}</p>
                </div>
            </div>
        </div>
    )

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
                    <h2 className="text-2xl font-semibold text-slate-800">Work Experience</h2>
                    {editingSections.experience && hasChanges && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs animate-pulse-custom">
                            <Info className="w-3 h-3" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                    {editingSections.experience && showSuccess && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs animate-fade-in">
                            <Check className="w-3 h-3" />
                            <span>Changes saved</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleEdit("experience")}
                        className={`flex items-center space-x-2 px-4 py-2 cursor-pointer rounded-lg transition-all duration-200 ${editingSections.experience
                            ? "bg-gray-600 text-white hover:bg-gray-700"
                            : "bg-slate-600 text-white hover:bg-slate-700"
                            }`}
                    >
                        {editingSections.experience ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        <span>{editingSections.experience ? "Cancel" : "Edit"}</span>
                    </button>
                    {editingSections.experience && (
                        <button
                            onClick={handleAddExperience}
                            className="flex items-center cursor-pointer space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Experience</span>
                        </button>
                    )}
                    {editingSections.experience && (
                        <SaveButtonTooltip
                            show={showTooltip}
                            message={
                                !hasChanges ? "You haven't made any changes" :
                                    !formsValid.experience ? "Click to see validation errors" :
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

            {profileData.experience.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No work experience added yet</h3>
                    <p className="text-gray-500 mb-6">Add your professional experience to showcase your career journey</p>
                    {editingSections.experience && (
                        <button
                            onClick={handleAddExperience}
                            className="inline-flex cursor-pointer items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Experience</span>
                        </button>
                    )}
                </div>
            ) : editingSections.experience ? (
                <div className="space-y-6">
                    {profileData.experience.map((exp, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-gray-900 text-lg">
                                    {exp.title || "New Position"} {exp.company && `at ${exp.company}`}
                                </h3>
                                <button
                                    onClick={() => handleRemoveExperience(index)}
                                    className="text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                    title="Delete experience"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={exp.title}
                                        onChange={(e) => handleInputChange(index, "title", e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 placeholder:text-gray-500 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${hasFieldError(`experience_${index}_title`) ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="e.g. Senior Software Engineer"
                                    />
                                    {hasFieldError(`experience_${index}_title`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`experience_${index}_title`)}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => handleInputChange(index, "company", e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 placeholder:text-gray-500 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${hasFieldError(`experience_${index}_company`) ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="e.g. Google, Microsoft"
                                    />
                                    {hasFieldError(`experience_${index}_company`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`experience_${index}_company`)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <LocationAutocomplete
                                        value={exp.location}
                                        onChange={(value) => handleInputChange(index, "location", value)}
                                        placeholder="e.g. San Francisco, CA"
                                        hasError={hasFieldError(`experience_${index}_location`)}
                                    />
                                    {hasFieldError(`experience_${index}_location`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`experience_${index}_location`)}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                                    <CustomDateInput
                                        value={exp.startDate}
                                        onChange={(e) => handleInputChange(index, "startDate", e.target.value)}
                                        placeholder="Select start date"
                                        hasError={hasFieldError(`experience_${index}_startDate`) || hasDateRangeError(index)}
                                    />
                                    {hasFieldError(`experience_${index}_startDate`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`experience_${index}_startDate`)}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date <span className="text-red-500">*</span></label>
                                    <CustomDateInput
                                        value={exp.current ? "" : exp.endDate}
                                        onChange={(e) => handleInputChange(index, "endDate", e.target.value)}
                                        placeholder={exp.current ? "Currently working here" : "Select end date"}
                                        disabled={exp.current}
                                        hasError={hasFieldError(`experience_${index}_endDate`) || hasDateRangeError(index)}
                                    />
                                    {hasFieldError(`experience_${index}_endDate`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`experience_${index}_endDate`)}</span>
                                        </p>
                                    )}
                                    {hasDateRangeError(index) && (
                                        <div className="mb-4">
                                            <p className="text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                                <Info className="w-3 h-3" />
                                                <span>{getDateRangeError(index)}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 mb-4">
                                <input
                                    type="checkbox"
                                    checked={exp.current}
                                    onChange={(e) => handleInputChange(index, "current", e.target.checked)}
                                    className="w-4 h-4 cursor-pointer text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm text-gray-700 font-medium">This is my current position</span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows="4"
                                    value={exp.description}
                                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                                    className={`w-full placeholder:text-gray-500 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${hasFieldError(`experience_${index}_description`) ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Describe your responsibilities, achievements, and key contributions... (minimum 20 characters)"
                                ></textarea>
                                {hasFieldError(`experience_${index}_description`) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                        <Info className="w-3 h-3" />
                                        <span>{getFieldError(`experience_${index}_description`)}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {profileData.experience.map((exp, index) => (
                        <ExperienceCard key={index} exp={exp} index={index} />
                    ))}
                </div>
            )}
            <ConfirmationModal />
        </div>
    )
}

export default ExperienceSection