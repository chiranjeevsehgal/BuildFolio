import { useState, useEffect, useRef } from "react"
import {
    Edit3,
    Save,
    Plus,
    Briefcase,
    Loader2,
    Trash2,
    Info,
} from "lucide-react"

const ExperienceSection = ({
    profileData,
    updateExperience,
    addExperience,
    removeExperience,
    editingSections,
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
    const tooltipRef = useRef(null)

    // Helper functions
    const getFieldError = (fieldName) => {
        return validationErrors[fieldName] && touchedFields[fieldName] ? validationErrors[fieldName][0] : ""
    }

    const hasFieldError = (fieldName) => {
        return !!validationErrors[fieldName] && touchedFields[fieldName]
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

    // Check for changes when profileData changes
    useEffect(() => {
        if (originalData && editingSections.experience) {
            const currentData = createExperienceCopy(profileData.experience)
            const dataChanged = !deepEqual(originalData, currentData)
            setHasChanges(dataChanged)
        }
    }, [profileData, originalData, editingSections.experience])

    // Store original data when entering edit mode
    useEffect(() => {
        if (editingSections.experience && !originalData) {
            setOriginalData(createExperienceCopy(profileData.experience))
        } else if (!editingSections.experience) {
            // Reset when exiting edit mode
            setOriginalData(null)
            setHasChanges(false)
            setShowTooltip(false)
        }
    }, [editingSections.experience, profileData])

    // Enhanced toggle function to reset changes when canceling
    const handleToggleEdit = (sectionName) => {
        if (editingSections.experience && hasChanges) {
            // If user is canceling with changes, ask for confirmation
            const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?")
            if (!confirmCancel) return
            
            // Restore original data
            if (originalData) {
                if (window.restoreExperienceData) {
                    window.restoreExperienceData(originalData)
                }
            }
        }
        
        toggleSectionEdit(sectionName)
    }

    // Enhanced save function
    const handleSave = async () => {
        if (!hasChanges) return
        
        const success = await saveExperienceProfile()
        if (success) {
            setOriginalData(createExperienceCopy(profileData.experience))
            setHasChanges(false)
        }
    }

    const handleAddExperience = () => {
        addExperience()
    }

    const handleRemoveExperience = (index) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this experience?")
        if (confirmDelete) {
            removeExperience(index)
        }
    }

    const shouldDisableSave = isSaving || !formsValid.experience || !hasChanges
    const saveButtonText = isSaving ? "Saving..." : !hasChanges ? "No Changes" : "Save"

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
                    <h2 className="text-2xl font-semibold text-slate-800">Work Experience</h2>
                    {editingSections.experience && hasChanges && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                            <Info className="w-3 h-3" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleEdit("experience")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            editingSections.experience 
                                ? "bg-gray-600 text-white hover:bg-gray-700" 
                                : "bg-slate-600 text-white hover:bg-slate-700"
                        }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>{editingSections.experience ? "Cancel" : "Edit"}</span>
                    </button>
                    {editingSections.experience && (
                        <button
                            onClick={handleAddExperience}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Experience</span>
                        </button>
                    )}
                    {editingSections.experience && (
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
                                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
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

            {profileData.experience.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg font-medium mb-2">No work experience added yet</p>
                    <p className="text-sm">Click "Edit" then "Add Experience" to get started</p>
                </div>
            ) : editingSections.experience ? (
                <div className="space-y-6">
                    {profileData.experience.map((exp, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-slate-800">
                                    {exp.title || "New Position"} {exp.company && `at ${exp.company}`}
                                </h3>
                                <button 
                                    onClick={() => handleRemoveExperience(index)} 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                    title="Delete experience"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <input
                                        type="text"
                                        value={exp.title}
                                        onChange={(e) => updateExperience(index, "title", e.target.value)}
                                        onBlur={() => handleFieldTouch(`experience_${index}_title`)}
                                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors ${
                                            hasFieldError(`experience_${index}_title`) ? "border-red-500" : "border-slate-300"
                                        }`}
                                        placeholder="Job Title *"
                                    />
                                    {hasFieldError(`experience_${index}_title`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`experience_${index}_title`)}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                                        onBlur={() => handleFieldTouch(`experience_${index}_company`)}
                                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors ${
                                            hasFieldError(`experience_${index}_company`) ? "border-red-500" : "border-slate-300"
                                        }`}
                                        placeholder="Company Name *"
                                    />
                                    {hasFieldError(`experience_${index}_company`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`experience_${index}_company`)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <input
                                        type="text"
                                        value={exp.location}
                                        onChange={(e) => updateExperience(index, "location", e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors"
                                        placeholder="Location"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="month"
                                        value={exp.startDate}
                                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                                        onBlur={() => handleFieldTouch(`experience_${index}_startDate`)}
                                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors ${
                                            hasFieldError(`experience_${index}_startDate`) ? "border-red-500" : "border-slate-300"
                                        }`}
                                        placeholder="Start Date"
                                    />
                                    {hasFieldError(`experience_${index}_startDate`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`experience_${index}_startDate`)}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="month"
                                        value={exp.current ? "" : exp.endDate}
                                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                                        onBlur={() => handleFieldTouch(`experience_${index}_endDate`)}
                                        disabled={exp.current}
                                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full disabled:bg-slate-100 transition-colors ${
                                            hasFieldError(`experience_${index}_endDate`) ? "border-red-500" : "border-slate-300"
                                        }`}
                                        placeholder="End Date"
                                    />
                                    {hasFieldError(`experience_${index}_endDate`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`experience_${index}_endDate`)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 mb-4">
                                <input
                                    type="checkbox"
                                    checked={exp.current}
                                    onChange={(e) => updateExperience(index, "current", e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm text-slate-600">Current position</span>
                            </div>

                            <div>
                                <textarea
                                    rows="3"
                                    value={exp.description}
                                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                                    onBlur={() => handleFieldTouch(`experience_${index}_description`)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                                        hasFieldError(`experience_${index}_description`) ? "border-red-500" : "border-slate-300"
                                    }`}
                                    placeholder="Describe your responsibilities, achievements, and key contributions... (minimum 20 characters) *"
                                ></textarea>
                                {hasFieldError(`experience_${index}_description`) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                        <Info className="w-3 h-3" />
                                        <span>{getFieldError(`experience_${index}_description`)}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {profileData.experience.map((exp, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                            <div className="mb-4">
                                <h3 className="font-medium text-slate-800 text-lg">
                                    {exp.title} {exp.company && `at ${exp.company}`}
                                </h3>
                                <p className="text-slate-600 text-sm mt-1">
                                    {exp.location && `${exp.location} • `}
                                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                                </p>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{exp.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExperienceSection