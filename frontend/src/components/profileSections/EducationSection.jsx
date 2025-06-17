import { useState, useEffect, useRef } from "react"
import {
    Edit3,
    Save,
    Plus,
    GraduationCap,
    Loader2,
    Trash2,
    Info,
} from "lucide-react"
import Toast from "../Toast"
import { LocationAutocomplete, UniversityAutocomplete } from "./Location_UniversitySearch"
import CustomDateInput from "./CustomDateInput"

const EducationSection = ({
    profileData,
    setProfileData,
    editingSections,
    toggleSectionEdit,
    showMessage,
    saveEducationProfile,
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
    const [message, setMessage] = useState({ type: "", content: "" })
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

    // Create deep copy of education array
    const createEducationCopy = (education) => {
        return education.map(edu => ({
            degree: edu.degree || "",
            school: edu.school || "",
            location: edu.location || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            description: edu.description || ""
        }))
    }

    // Filter out incomplete educations before saving
    const getValidEducations = (educations) => {
        return educations.filter(edu => {
            return edu.degree &&
                edu.degree.trim() !== "" &&
                edu.school &&
                edu.school.trim() !== "" &&
                edu.startDate &&
                edu.startDate.trim() !== "" &&
                edu.endDate &&
                edu.endDate.trim() !== ""
        })
    }

    // Check for changes when profileData changes
    useEffect(() => {
        if (originalData && editingSections.education) {
            const currentData = createEducationCopy(profileData.education)
            const dataChanged = !deepEqual(originalData, currentData)
            setHasChanges(dataChanged)
        }
    }, [profileData, originalData, editingSections.education])

    // Store original data when entering edit mode
    useEffect(() => {
        if (editingSections.education && !originalData) {
            setOriginalData(createEducationCopy(profileData.education))
        } else if (!editingSections.education) {
            // Reset when exiting edit mode
            setOriginalData(null)
            setHasChanges(false)
            setShowTooltip(false)
        }
    }, [editingSections.education, profileData])

    // Enhanced toggle function to reset changes when canceling
    const handleToggleEdit = (sectionName) => {
        if (editingSections.education && hasChanges) {
            // If user is canceling with changes, ask for confirmation
            const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?")
            if (!confirmCancel) return

            // Restore original data
            if (originalData) {
                setProfileData(prev => ({
                    ...prev,
                    education: originalData
                }))
            }
        }

        toggleSectionEdit(sectionName)
    }

    // Enhanced save function with validation filtering
    const handleSave = async () => {
        if (!hasChanges) return

        // Filter out incomplete educations before saving
        const validEducations = getValidEducations(profileData.education)

        // Check if we have any valid educations to save
        if (validEducations.length === 0) {
            showMessage('error', 'Please complete at least one education with all required fields before saving.')
            return
        }

        // Update profileData with filtered educations before saving
        const originalEducations = profileData.education
        setProfileData(prev => ({
            ...prev,
            education: validEducations
        }))

        const success = await saveEducationProfile()

        if (success) {
            // Update original data to current data after successful save
            setOriginalData(createEducationCopy(validEducations))
            setHasChanges(false)
        } else {
            // If save fails, restore original data
            setProfileData(prev => ({
                ...prev,
                education: originalEducations
            }))
        }
    }

    // Enhanced add education to track changes
    const handleAddEducation = () => {
        const newEdu = {
            degree: "",
            school: "",
            location: "",
            startDate: "",
            endDate: "",
            description: "",
        }
        setProfileData((prev) => ({
            ...prev,
            education: [...prev.education, newEdu],
        }))
        // Changes will be detected automatically via useEffect
    }

    // Enhanced remove education to track changes
    const handleRemoveEducation = (index) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this education?")
        if (confirmDelete) {
            setProfileData((prev) => ({
                ...prev,
                education: prev.education.filter((_, i) => i !== index),
            }))
            // Changes will be detected automatically via useEffect
        }
    }

    // Update education function
    const updateEducation = (index, field, value) => {
        setProfileData((prev) => ({
            ...prev,
            education: prev.education.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        }))
    }

    // Determine save button state
    const shouldDisableSave = isSaving || !formsValid.education || !hasChanges
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
            <Toast
                message={message}
                onClose={() => setMessage({ type: "", content: "" })}
            />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-semibold text-slate-800">Education</h2>
                    {editingSections.education && hasChanges && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                            <Info className="w-3 h-3" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleEdit("education")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${editingSections.education
                            ? "bg-gray-600 text-white hover:bg-gray-700"
                            : "bg-slate-600 text-white hover:bg-slate-700"
                            }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>{editingSections.education ? "Cancel" : "Edit"}</span>
                    </button>
                    {editingSections.education && (
                        <button
                            onClick={handleAddEducation}
                            className="flex items-center cursor-pointer space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Education</span>
                        </button>
                    )}
                    {editingSections.education && (
                        <SaveButtonTooltip show={showTooltip && !hasChanges}>
                            <button
                                ref={tooltipRef}
                                onClick={handleSave}
                                disabled={shouldDisableSave}
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${shouldDisableSave
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer hover:shadow-lg transform hover:scale-105"
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

            {profileData.education.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg font-medium mb-2">No education added yet</p>
                    <p className="text-sm">Click "Edit" then "Add Education" to get started</p>
                </div>
            ) : editingSections.education ? (
                <div className="space-y-6">
                    {profileData.education.map((edu, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-slate-800">
                                    {edu.degree || "New Education"} {edu.school && `at ${edu.school}`}
                                </h3>
                                <button
                                    onClick={() => handleRemoveEducation(index)}
                                    className="text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                    title="Delete education"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                        onBlur={() => handleFieldTouch(`education_${index}_degree`)}
                                        className={`px-3 placeholder:!text-gray-500 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors ${hasFieldError(`education_${index}_degree`) ? "border-red-500" : "border-slate-300"
                                            }`}
                                        placeholder="Degree/Certification *"
                                    />
                                    {hasFieldError(`education_${index}_degree`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`education_${index}_degree`)}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {/* <input
                                        type="text"
                                        value={edu.school}
                                        onChange={(e) => updateEducation(index, "school", e.target.value)}
                                        onBlur={() => handleFieldTouch(`education_${index}_school`)}
                                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors ${hasFieldError(`education_${index}_school`) ? "border-red-500" : "border-slate-300"
                                            }`}
                                        placeholder="Institution Name *"
                                    /> */}
                                    <UniversityAutocomplete
                                        value={edu.school}
                                        onChange={(value) => updateEducation(index, "school", value)}
                                        placeholder="University/College Name"
                                        hasError={hasFieldError(`education_${index}_education`)}
                                    />
                                    {hasFieldError(`education_${index}_school`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`education_${index}_school`)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                {/* <input
                                    type="text"
                                    value={edu.location}
                                    onChange={(e) => updateEducation(index, "location", e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Location"
                                /> */}
                                <LocationAutocomplete
                                    value={edu.location}
                                    onChange={(value) => updateEducation(index, "location", value)}
                                    placeholder="Location"
                                    hasError={hasFieldError(`education_${index}_location`)}
                                />
                                {hasFieldError(`education_${index}_location`) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                        <Info className="w-3 h-3" />
                                        <span>{getFieldError(`education_${index}_location`)}</span>
                                    </p>
                                )}
                                <div>
                                    <CustomDateInput
                                        value={edu.startDate}
                                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                                        onBlur={() => handleFieldTouch(`education_${index}_startDate`)}
                                        placeholder="Select start date"
                                        hasError={hasFieldError(`education_${index}_startDate`)}
                                        required
                                    />
                                    {hasFieldError(`education_${index}_startDate`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`education_${index}_startDate`)}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <CustomDateInput
                                        value={edu.endDate}
                                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                                        onBlur={() => handleFieldTouch(`education_${index}_endDate`)}
                                        placeholder={edu.endDate && new Date(edu.endDate + '-01') > new Date() ?
                                            "Expected completion date" : "Select end date"}
                                        hasError={hasFieldError(`education_${index}_endDate`)}
                                    />
                                    {hasFieldError(`education_${index}_endDate`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`education_${index}_endDate`)}</span>
                                        </p>
                                    )}
                                </div>

                            </div>

                            <textarea
                                rows="2"
                                value={edu.description}
                                onChange={(e) => updateEducation(index, "description", e.target.value)}
                                className="w-full px-3 placeholder:!text-gray-500 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                                placeholder="Additional details, achievements, or relevant coursework..."
                            ></textarea>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {profileData.education.map((edu, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                            <div className="mb-4">
                                <h3 className="font-medium text-slate-800 text-lg">
                                    {edu.degree} {edu.school && `at ${edu.school}`}
                                </h3>
                                <p className="text-slate-600 text-sm mt-1">
                                    {edu.location && `${edu.location} • `}
                                    {edu.startDate} - {edu.endDate}
                                </p>
                            </div>
                            {edu.description && <p className="text-slate-700 leading-relaxed">{edu.description}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default EducationSection