import { useState, useEffect, useRef, useCallback } from "react"
import {
    Edit3,
    Save,
    Plus,
    X,
    Award,
    ExternalLink,
    Github,
    Loader2,
    Trash2,
    Info,
    Check,
    Folder,
    Star,
} from "lucide-react"
import { ensureHttpProtocol } from "../../utils/helperFunctions"
import toast, { Toaster } from 'react-hot-toast';
import { useConfirmationModal } from '../ConfirmationModal';


const ProjectsSection = ({
    profileData,
    setProfileData,
    updateProject,
    removeProject,
    resumeprofileData,
    setResumeProfileData,
    addProjectSkill,
    removeProjectSkill,
    editingSections,
    toggleSectionEdit,
    showMessage,
    saveProjectProfile,
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

    // Helper functions - More precise error checking
    const getFieldError = (fieldName) => {
        // Only show error if:
        // 1. This specific field is touched AND has an error, OR
        // 2. Save was attempted AND this specific field has an error
        const isFieldTouched = touchedFields[fieldName]
        const fieldHasError = validationErrors[fieldName]
        const showOnSaveAttempt = saveAttempted && fieldHasError

        return fieldHasError && (isFieldTouched || showOnSaveAttempt) ? validationErrors[fieldName][0] : ""
    }

    const hasFieldError = (fieldName) => {
        // Only show error if:
        // 1. This specific field is touched AND has an error, OR
        // 2. Save was attempted AND this specific field has an error
        const isFieldTouched = touchedFields[fieldName]
        const fieldHasError = !!validationErrors[fieldName]
        const showOnSaveAttempt = saveAttempted && fieldHasError

        return fieldHasError && (isFieldTouched || showOnSaveAttempt)
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

    // Create deep copy of projects array
    const createProjectsCopy = (projects) => {
        return projects.map(project => ({
            title: project.title || "",
            description: project.description || "",
            skills: [...(project.skills || [])],
            url: project.url || "",
            githubUrl: project.githubUrl || "",
            featured: project.featured || false,
            skill: project.skill || "" // Include temp skill field
        }))
    }

    // Memoized function to get current data
    const getCurrentData = useCallback(() => createProjectsCopy(profileData.projects), [profileData.projects])


    // Check for changes when profileData changes
    useEffect(() => {
        if (originalData && editingSections.projects) {
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
    }, [resumeprofileData, profileData.projects, originalData, editingSections.projects, getCurrentData, saveAttempted])

    // Store original data when entering edit mode
    useEffect(() => {
        if (!resumeprofileData) {
            if (editingSections.projects && !originalData) {
                const currentData = getCurrentData()
                setOriginalData(currentData)
            } else if (!editingSections.projects) {
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
    }, [editingSections.projects, getCurrentData])

    // Enhanced toggle function to reset changes when canceling
    const handleToggleEdit = async (sectionName) => {
        if (editingSections.projects && hasChanges) {
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
                setProfileData(prev => ({
                    ...prev,
                    projects: originalData
                }))
            }
        }

        toggleSectionEdit(sectionName)
    }

    // Function to touch only fields that have validation errors
    const touchErrorFields = () => {
        profileData.projects.forEach((_, index) => {
            const fieldsToValidate = ['title', 'description', 'url', 'githubUrl', 'skills']
            fieldsToValidate.forEach(field => {
                const fieldName = `project_${index}_${field}`
                // Only touch fields that have validation errors
                if (validationErrors[fieldName]) {
                    handleFieldTouch(fieldName)
                }
            })
        })
    }

    // Enhanced save function with better error handling
    const handleSave = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (isSaving) return

        // Set save attempted to show errors for invalid fields only
        setSaveAttempted(true)

        // If no changes, show message and return
        if (!hasChanges) {
            return
        }

        // If there are validation errors, touch only the error fields and don't proceed with save
        if (!formsValid.projects) {
            touchErrorFields()
            return
        }

        try {
            const success = await saveProjectProfile()
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
        updateProject(index, field, value)
        // Touch only this specific field immediately when user starts typing
        const fieldName = `project_${index}_${field}`
        handleFieldTouch(fieldName)
    }

    // Enhanced add project to track changes
    const handleAddProject = () => {
        const newProject = {
            title: "",
            description: "",
            skills: [],
            url: "",
            githubUrl: "",
            featured: false,
            skill: "" // Temporary field for adding skills
        }
        setProfileData((prev) => ({
            ...prev,
            projects: [...prev.projects, newProject],
        }))
    }

    // Enhanced remove project to track changes
    const handleRemoveProject = async (index) => {
        await showConfirmation({
            title: "Delete Project",
            message: "Are you sure you want to delete this project? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger"
        });

        removeProject(index)
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
    const canSave = hasChanges && formsValid.projects && !isSaving
    const showSuccess = lastSaveTime && !hasChanges && !isSaving

    const getSaveButtonState = () => {
        if (isSaving) return { text: "Saving...", icon: Loader2, className: "bg-blue-500 text-white cursor-wait", disabled: true }
        if (showSuccess) return { text: "Saved", icon: Check, className: "bg-green-600 text-white cursor-default", disabled: true }
        if (!hasChanges) return { text: "No Changes", icon: Save, className: "bg-gray-300 text-gray-500 cursor-pointer", disabled: false }
        if (!formsValid.projects) return { text: "Save Changes", icon: Save, className: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 cursor-pointer", disabled: false }
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

    // Enhanced read-only project card
    const ProjectCard = ({ project, index }) => (
        <div className="group p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Folder className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                                {project.title}
                                {project.featured && (
                                    <Star className="w-4 h-4 ml-2 text-yellow-500 fill-current" />
                                )}
                            </h3>
                            <div className="flex items-center space-x-4 mb-3">
                                {project.url && (
                                    <a
                                        href={ensureHttpProtocol(project.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        Live Demo
                                    </a>
                                )}
                                {project.githubUrl && (
                                    <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 hover:text-gray-800 text-sm flex items-center transition-colors"
                                    >
                                        <Github className="w-4 h-4 mr-1" />
                                        GitHub
                                    </a>
                                )}
                            </div>
                        </div>
                        {project.featured && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                Featured
                            </span>
                        )}
                    </div>
                    {project.description && (
                        <p className="text-gray-700 leading-relaxed text-sm mb-3">{project.description}</p>
                    )}
                    {project.skills && project.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, skillIndex) => (
                                <span
                                    key={skillIndex}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
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
                    <h2 className="text-2xl font-semibold text-slate-800">Projects</h2>
                    {editingSections.projects && hasChanges && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs animate-pulse-custom">
                            <Info className="w-3 h-3" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                    {editingSections.projects && showSuccess && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs animate-fade-in">
                            <Check className="w-3 h-3" />
                            <span>Changes saved</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleEdit("projects")}
                        className={`flex items-center space-x-2 px-4 py-2 cursor-pointer rounded-lg transition-all duration-200 ${editingSections.projects
                            ? "bg-gray-600 text-white hover:bg-gray-700"
                            : "bg-slate-600 text-white hover:bg-slate-700"
                            }`}
                    >
                        {editingSections.projects ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        <span>{editingSections.projects ? "Cancel" : "Edit"}</span>
                    </button>
                    {editingSections.projects && (
                        <button
                            onClick={handleAddProject}
                            className="flex items-center cursor-pointer space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Project</span>
                        </button>
                    )}
                    {editingSections.projects && (
                        <SaveButtonTooltip
                            show={showTooltip}
                            message={
                                !hasChanges ? "You haven't made any changes" :
                                    !formsValid.projects ? "Click to see validation errors" :
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

            {profileData.projects.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects added yet</h3>
                    <p className="text-gray-500 mb-6">Showcase your best work and personal projects</p>
                    {editingSections.projects && (
                        <button
                            onClick={handleAddProject}
                            className="inline-flex cursor-pointer  items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Project</span>
                        </button>
                    )}
                </div>
            ) : editingSections.projects ? (
                <div className="space-y-6">
                    {profileData.projects.map((project, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-gray-900 text-lg">
                                    {project.title || "New Project"}
                                    {project.featured && (
                                        <Star className="inline w-4 h-4 ml-2 text-yellow-500 fill-current" />
                                    )}
                                </h3>
                                <button
                                    onClick={() => handleRemoveProject(index)}
                                    className="text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                    title="Delete project"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={project.title}
                                    onChange={(e) => handleInputChange(index, "title", e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 placeholder:text-gray-500 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${hasFieldError(`project_${index}_title`) ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="e.g. E-commerce Web Application"
                                />
                                {hasFieldError(`project_${index}_title`) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                        <Info className="w-3 h-3" />
                                        <span>{getFieldError(`project_${index}_title`)}</span>
                                    </p>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project URL</label>
                                    <input
                                        type="url"
                                        value={project.url}
                                        onChange={(e) => handleInputChange(index, "url", e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 placeholder:text-gray-500 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${hasFieldError(`project_${index}_url`) ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="https://your-project.com"
                                    />
                                    {hasFieldError(`project_${index}_url`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`project_${index}_url`)}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                                    <input
                                        type="url"
                                        value={project.githubUrl}
                                        onChange={(e) => handleInputChange(index, "githubUrl", e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 placeholder:text-gray-500 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${hasFieldError(`project_${index}_githubUrl`) ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="https://github.com/username/repo"
                                    />
                                    {hasFieldError(`project_${index}_githubUrl`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`project_${index}_githubUrl`)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(project.skills || []).map((skill, skillIndex) => (
                                        <span
                                            key={skillIndex}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 transition-all duration-200 hover:bg-blue-200"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => removeProjectSkill(index, skillIndex)}
                                                className="ml-2 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors hover:bg-blue-200 rounded-full p-0.5"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={project.skill}
                                        onChange={(e) => handleInputChange(index, "skill", e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && addProjectSkill(index)}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Add a technology (e.g. React, Node.js)"
                                    />
                                    <button
                                        onClick={() => addProjectSkill(index)}
                                        className="px-4 py-3 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                {hasFieldError(`project_${index}_skills`) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                        <Info className="w-3 h-3" />
                                        <span>{getFieldError(`project_${index}_skills`)}</span>
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                                <textarea
                                    rows="4"
                                    value={project.description}
                                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                                    className={`w-full placeholder:text-gray-500 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 ${hasFieldError(`project_${index}_description`) ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Describe your project, key features, challenges solved, and technologies used... (minimum 20 characters)"
                                ></textarea>
                                {hasFieldError(`project_${index}_description`) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                                        <Info className="w-3 h-3" />
                                        <span>{getFieldError(`project_${index}_description`)}</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={project.featured}
                                    onChange={(e) => handleInputChange(index, "featured", e.target.checked)}
                                    className="w-4 h-4 text-purple-600 cursor-pointer bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                />
                                <span className="text-sm text-gray-700 font-medium flex items-center">
                                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                    Featured project (highlight as your best work)
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {profileData.projects.map((project, index) => (
                        <ProjectCard key={index} project={project} index={index} />
                    ))}
                </div>
            )}
            <Toaster
                position="top-center"
                reverseOrder={true}
            />
            <ConfirmationModal />
        </div>
    )
}

export default ProjectsSection