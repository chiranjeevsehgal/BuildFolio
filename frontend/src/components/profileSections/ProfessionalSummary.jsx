import { useState, useEffect, useRef } from "react"
import {
    Edit3,
    Save,
    Plus,
    X,
    Loader2,
    Info,
} from "lucide-react"

const ProfessionalSummarySection = ({
    profileData,
    updateProfileData,
    newSkill,
    setNewSkill,
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
    const tooltipRef = useRef(null)

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

    // Check for changes when profileData changes
    useEffect(() => {
        if (originalData && editingSections.professional) {
            const currentData = {
                title: profileData.professional.title,
                summary: profileData.professional.summary,
                skills: [...profileData.professional.skills] // Create a copy of the array
            }
            
            const dataChanged = !deepEqual(originalData, currentData)
            setHasChanges(dataChanged)
        }
    }, [profileData, originalData, editingSections.professional])

    // Store original data when entering edit mode
    useEffect(() => {
        if (editingSections.professional && !originalData) {
            setOriginalData({
                title: profileData.professional.title,
                summary: profileData.professional.summary,
                skills: [...profileData.professional.skills] // Create a copy of the array
            })
        } else if (!editingSections.professional) {
            // Reset when exiting edit mode
            setOriginalData(null)
            setHasChanges(false)
            setShowTooltip(false)
        }
    }, [editingSections.professional, profileData])

    // Enhanced toggle function to reset changes when canceling
    const handleToggleEdit = (sectionName) => {
        if (editingSections.professional && hasChanges) {
            // If user is canceling with changes, ask for confirmation
            const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?")
            if (!confirmCancel) return
            
            // Restore original data
            if (originalData) {
                updateProfileData("professional", "title", originalData.title)
                updateProfileData("professional", "summary", originalData.summary)
                // Restore skills array
                updateProfileData("professional", "skills", [...originalData.skills])
            }
        }
        
        toggleSectionEdit(sectionName)
    }

    // Enhanced save function
    const handleSave = async () => {
        if (!hasChanges) return
        
        const success = await saveProfessionalProfile()
        if (success) {
            // Update original data to current data after successful save
            setOriginalData({
                title: profileData.professional.title,
                summary: profileData.professional.summary,
                skills: [...profileData.professional.skills]
            })
            setHasChanges(false)
        }
    }

    // Determine save button state
    const shouldDisableSave = isSaving || !formsValid.professional || !hasChanges
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
                    <h2 className="text-2xl font-semibold text-slate-800">Professional Summary</h2>
                    {editingSections.professional && hasChanges && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                            <Info className="w-3 h-3" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleEdit("professional")}
                        className={`flex items-center space-x-2 px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                            editingSections.professional 
                                ? "bg-gray-600 text-white hover:bg-gray-700" 
                                : "bg-slate-600 text-white hover:bg-slate-700"
                        }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>{editingSections.professional ? "Cancel" : "Edit"}</span>
                    </button>
                    {editingSections.professional && (
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
                                        : "bg-blue-600 text-white cursor-pointer hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
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

            {editingSections.professional ? (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Professional Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={profileData.professional.title}
                            onChange={(e) => updateProfileData("professional", "title", e.target.value)}
                            onBlur={() => handleFieldTouch("title")}
                            className={`w-full px-4 py-3 border rounded-lg placeholder:!text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                hasFieldError("title") ? "border-red-500" : "border-slate-300"
                            }`}
                            placeholder="e.g. Senior Software Engineer"
                        />
                        {hasFieldError("title") && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("title")}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Professional Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows="4"
                            value={profileData.professional.summary}
                            onChange={(e) => updateProfileData("professional", "summary", e.target.value)}
                            onBlur={() => handleFieldTouch("summary")}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 placeholder:!text-gray-500 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                                hasFieldError("summary") ? "border-red-500" : "border-slate-300"
                            }`}
                            placeholder="Write a brief summary of your professional background and expertise... (minimum 50 characters)"
                            maxLength="1000"
                        ></textarea>
                        <div className="flex justify-between mt-1">
                            <div>
                                {hasFieldError("summary") && (
                                    <p className="text-sm text-red-600 flex items-center space-x-1">
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
                            Skills <span className="text-red-500">*</span> (minimum 3)
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {profileData.professional.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 transition-all duration-200 hover:bg-blue-200"
                                >
                                    {skill}
                                    <button 
                                        onClick={() => removeSkill(index)} 
                                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors hover:bg-blue-200 rounded-full p-0.5"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                                onBlur={() => handleFieldTouch("skills")}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 placeholder:!text-gray-500 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                <Info className="w-3 h-3" />
                                <span>{getFieldError("skills")}</span>
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <DisplayField label="Professional Title" value={profileData.professional.title} />
                    <DisplayField label="Professional Summary" value={profileData.professional.summary} />
                    <div className="py-2">
                        <span className="text-sm font-medium text-slate-600">Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {profileData.professional.skills.length > 0 ? (
                                profileData.professional.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-500">No skills added</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfessionalSummarySection