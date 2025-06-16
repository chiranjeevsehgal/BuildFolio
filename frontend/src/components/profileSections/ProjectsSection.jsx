import { useState, useEffect, useRef } from "react"
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
} from "lucide-react"
import { ensureHttpProtocol } from "../../utils/helperFunctions"
import Toast from "../Toast"

const ProjectsSection = ({
    profileData,
    setProfileData,
    updateProject,
    removeProject,
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

    // Filter out incomplete projects before saving
    const getValidProjects = (projects) => {
        return projects.filter(project => {
            return project.title && 
                   project.title.trim() !== "" && 
                   project.description && 
                   project.description.trim() !== "" &&
                   project.description.length >= 20 // Minimum description length
        }).map(project => {
            // Remove temporary skill field before saving
            const { skill, ...projectToSave } = project
            return projectToSave
        })
    }

    // Check for changes when profileData changes
    useEffect(() => {
        if (originalData && editingSections.projects) {
            const currentData = createProjectsCopy(profileData.projects)
            const dataChanged = !deepEqual(originalData, currentData)
            setHasChanges(dataChanged)
        }
    }, [profileData, originalData, editingSections.projects])

    // Store original data when entering edit mode
    useEffect(() => {
        if (editingSections.projects && !originalData) {
            setOriginalData(createProjectsCopy(profileData.projects))
        } else if (!editingSections.projects) {
            // Reset when exiting edit mode
            setOriginalData(null)
            setHasChanges(false)
            setShowTooltip(false)
        }
    }, [editingSections.projects, profileData])

    // Enhanced toggle function to reset changes when canceling
    const handleToggleEdit = (sectionName) => {
        if (editingSections.projects && hasChanges) {
            // If user is canceling with changes, ask for confirmation
            const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?")
            if (!confirmCancel) return

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

    // Enhanced save function with validation filtering
    const handleSave = async () => {
        if (!hasChanges) return

        // Filter out incomplete projects before saving
        const validProjects = getValidProjects(profileData.projects)

        // Check if we have any valid projects to save
        if (validProjects.length === 0) {
            showMessage('error', 'Please complete at least one project with all required fields before saving.')
            return
        }

        // Update profileData with filtered projects before saving
        const originalProjects = profileData.projects
        setProfileData(prev => ({
            ...prev,
            projects: validProjects
        }))

        const success = await saveProjectProfile()

        if (success) {
            // Update original data to current data after successful save
            setOriginalData(createProjectsCopy(validProjects))
            setHasChanges(false)
        } else {
            // If save fails, restore original data
            setProfileData(prev => ({
                ...prev,
                projects: originalProjects
            }))
        }
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
        // Changes will be detected automatically via useEffect
    }

    // Enhanced remove project to track changes
    const handleRemoveProject = (index) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this project?")
        if (confirmDelete) {
            removeProject(index)
            // Changes will be detected automatically via useEffect
        }
    }

    // Determine save button state
    const shouldDisableSave = isSaving || !formsValid.projects || !hasChanges
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
                    <h2 className="text-2xl font-semibold text-slate-800">Projects</h2>
                    {editingSections.projects && hasChanges && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                            <Info className="w-3 h-3" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleEdit("projects")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            editingSections.projects 
                                ? "bg-gray-600 text-white hover:bg-gray-700" 
                                : "bg-slate-600 text-white hover:bg-slate-700"
                        }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>{editingSections.projects ? "Cancel" : "Edit"}</span>
                    </button>
                    {editingSections.projects && (
                        <button
                            onClick={handleAddProject}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Project</span>
                        </button>
                    )}
                    {editingSections.projects && (
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

            {profileData.projects.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg font-medium mb-2">No projects added yet</p>
                    <p className="text-sm">Click "Edit" then "Add Project" to showcase your work</p>
                </div>
            ) : editingSections.projects ? (
                <div className="space-y-6">
                    {profileData.projects.map((project, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-slate-800">{project.title || "New Project"}</h3>
                                <button 
                                    onClick={() => handleRemoveProject(index)} 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                    title="Delete project"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid md:grid-cols-1 gap-4 mb-4">
                                <div>
                                    <input
                                        type="text"
                                        value={project.title}
                                        onChange={(e) => updateProject(index, "title", e.target.value)}
                                        onBlur={() => handleFieldTouch(`project_${index}_title`)}
                                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors ${
                                            hasFieldError(`project_${index}_title`) ? "border-red-500" : "border-slate-300"
                                        }`}
                                        placeholder="Project Title *"
                                    />
                                    {hasFieldError(`project_${index}_title`) && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                            <Info className="w-3 h-3" />
                                            <span>{getFieldError(`project_${index}_title`)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <input
                                    type="url"
                                    value={project.url}
                                    onChange={(e) => updateProject(index, "url", e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Project URL"
                                />
                                <input
                                    type="url"
                                    value={project.githubUrl}
                                    onChange={(e) => updateProject(index, "githubUrl", e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="GitHub URL"
                                />
                            </div>

                            <div className="gap-4 mb-4">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(project.skills || []).map((skill, skillIndex) => (
                                        <span
                                            key={skillIndex}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 transition-all duration-200 hover:bg-blue-200"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => removeProjectSkill(index, skillIndex)}
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
                                        value={project.skill}
                                        onChange={(e) => updateProject(index, "skill", e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && addProjectSkill(index)}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="Add a skill"
                                    />
                                    <button
                                        onClick={() => addProjectSkill(index)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                {hasFieldError(`project_${index}_skills`) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                        <Info className="w-3 h-3" />
                                        <span>{getFieldError(`project_${index}_skills`)}</span>
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <textarea
                                    rows="3"
                                    value={project.description}
                                    onChange={(e) => updateProject(index, "description", e.target.value)}
                                    onBlur={() => handleFieldTouch(`project_${index}_description`)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                                        hasFieldError(`project_${index}_description`) ? "border-red-500" : "border-slate-300"
                                    }`}
                                    placeholder="Project description and key features... (minimum 20 characters) *"
                                ></textarea>
                                {hasFieldError(`project_${index}_description`) && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                        <Info className="w-3 h-3" />
                                        <span>{getFieldError(`project_${index}_description`)}</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={project.featured}
                                    onChange={(e) => updateProject(index, "featured", e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm text-slate-600">Featured project</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {profileData.projects.map((project, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                            <div className="mb-4">
                                <h3 className="font-medium text-slate-800 text-lg flex items-center">
                                    {project.title}
                                    {project.featured && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                            Featured
                                        </span>
                                    )}
                                </h3>
                                <div className="flex space-x-4 mt-2">
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
                                            className="text-slate-600 hover:text-slate-800 text-sm flex items-center transition-colors"
                                        >
                                            <Github className="w-4 h-4 mr-1" />
                                            GitHub
                                        </a>
                                    )}
                                </div>
                            </div>
                            {project.description && <p className="text-slate-700 mb-3 leading-relaxed">{project.description}</p>}
                            {project.skills && project.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {project.skills.map((skill, skillIndex) => (
                                        <span
                                            key={skillIndex}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProjectsSection