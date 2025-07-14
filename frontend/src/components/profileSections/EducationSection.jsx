import { useState, useEffect, useRef, useCallback } from "react";
import {
  Edit3,
  Save,
  Plus,
  GraduationCap,
  Loader2,
  Trash2,
  Info,
  Check,
  X,
  MapPin,
  Calendar,
  Building,
} from "lucide-react";
import {
  LocationAutocomplete,
  UniversityAutocomplete,
} from "./Location_UniversitySearch";
import CustomDateInput from "./CustomDateInput";
import { useConfirmationModal } from "../ConfirmationModal";

const EducationSection = ({
  profileData,
  setProfileData,
  editingSections,
  toggleSectionEdit,
  showMessage,
  resumeprofileData,
  setResumeProfileData,
  saveEducationProfile,
  isSaving,
  formsValid,
  validationErrors,
  touchedFields,
  handleFieldTouch,
}) => {
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const { showConfirmation, ConfirmationModal } = useConfirmationModal();
  const tooltipRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Helper functions - More precise error checking
  const getFieldError = (fieldName) => {
    // Only show error if:
    // 1. This specific field is touched AND has an error, OR
    // 2. Save was attempted AND this specific field has an error
    const isFieldTouched = touchedFields[fieldName];
    const fieldHasError = validationErrors[fieldName];
    const showOnSaveAttempt = saveAttempted && fieldHasError;

    return fieldHasError && (isFieldTouched || showOnSaveAttempt)
      ? validationErrors[fieldName][0]
      : "";
  };

  const hasFieldError = (fieldName) => {
    // Only show error if:
    // 1. This specific field is touched AND has an error, OR
    // 2. Save was attempted AND this specific field has an error
    const isFieldTouched = touchedFields[fieldName];
    const fieldHasError = !!validationErrors[fieldName];
    const showOnSaveAttempt = saveAttempted && fieldHasError;

    return fieldHasError && (isFieldTouched || showOnSaveAttempt);
  };

  const getDateRangeError = (index) => {
    return validationErrors[`education_${index}_dateRange`] &&
      (touchedFields[`education_${index}_startDate`] ||
        touchedFields[`education_${index}_endDate`] ||
        saveAttempted)
      ? validationErrors[`education_${index}_dateRange`][0]
      : "";
  };

  const hasDateRangeError = (index) => {
    return (
      !!validationErrors[`education_${index}_dateRange`] &&
      (touchedFields[`education_${index}_startDate`] ||
        touchedFields[`education_${index}_endDate`] ||
        saveAttempted)
    );
  };

  // Deep comparison function for arrays and objects
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return false;

    if (typeof obj1 !== "object" || typeof obj2 !== "object")
      return obj1 === obj2;

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!deepEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }

    // Handle objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  };

  // Create deep copy of education array
  const createEducationCopy = (education) => {
    return education.map((edu) => ({
      degree: edu.degree || "",
      school: edu.school || "",
      location: edu.location || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      description: edu.description || "",
    }));
  };

  // Memoized function to get current data
  const getCurrentData = useCallback(
    () => createEducationCopy(profileData.education),
    [profileData.education]
  );

  // Check for changes when profileData changes
  useEffect(() => {
    if (originalData && editingSections.education) {
      const currentData = getCurrentData();
      const dataChanged = !deepEqual(originalData, currentData);
      setHasChanges(dataChanged);

      // Reset save attempted flag when data changes
      if (dataChanged && saveAttempted) {
        setSaveAttempted(false);
      }
    }

    if (resumeprofileData) {
      const currentData = resumeprofileData;
      const dataChanged = !deepEqual(originalData, currentData);
      setHasChanges(dataChanged);

      // Reset save attempted flag when data changes
      if (dataChanged && saveAttempted) {
        setSaveAttempted(false);
      }
    }
  }, [
    resumeprofileData,
    profileData.education,
    originalData,
    editingSections.education,
    getCurrentData,
    saveAttempted,
  ]);

  // Store original data when entering edit mode
  useEffect(() => {
    if (!resumeprofileData) {
      if (editingSections.education && !originalData) {
        const currentData = getCurrentData();
        setOriginalData(currentData);
      } else if (!editingSections.education) {
        // Reset when exiting edit mode
        setOriginalData(null);
        setHasChanges(false);
        setShowTooltip(false);
        setSaveAttempted(false);
        setLastSaveTime(null);
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      }
    }
  }, [editingSections.education, getCurrentData]);

  // Enhanced toggle function to reset changes when canceling
  const handleToggleEdit = async (sectionName) => {
    if (editingSections.education && hasChanges) {
      // If user is canceling with changes, ask for confirmation
      try {
        await showConfirmation({
          title: "Unsaved Changes",
          message: "You have unsaved changes. Are you sure you want to cancel?",
          confirmText: "Yes, Cancel",
          cancelText: "Keep Editing",
          type: "warning",
        });

        // Restore original data
        if (originalData) {
          setProfileData((prev) => ({
            ...prev,
            education: originalData,
          }));
        }
      } catch (error) {
        return;
      }
    }

    toggleSectionEdit(sectionName);
  };

  // Function to touch only fields that have validation errors
  const touchErrorFields = () => {
    profileData.education.forEach((_, index) => {
      const fieldsToValidate = [
        "degree",
        "school",
        "location",
        "startDate",
        "endDate",
        "description",
      ];
      fieldsToValidate.forEach((field) => {
        const fieldName = `education_${index}_${field}`;
        // Only touch fields that have validation errors
        if (validationErrors[fieldName]) {
          handleFieldTouch(fieldName);
        }
      });
    });
  };

  // Enhanced save function with better error handling
  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return;

    // Set save attempted to show errors for invalid fields only
    setSaveAttempted(true);

    // If no changes, show message and return
    if (!hasChanges) {
      return;
    }

    // If there are validation errors, touch only the error fields and don't proceed with save
    if (!formsValid.education) {
      touchErrorFields();
      return;
    }

    try {
      const success = await saveEducationProfile();
      if (success) {
        const currentData = getCurrentData();
        setOriginalData(currentData);
        setHasChanges(false);
        setLastSaveTime(new Date());
        setResumeProfileData(null);

        // Clear save attempted after successful save
        saveTimeoutRef.current = setTimeout(() => {
          setSaveAttempted(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Save failed:", error);
      // Keep saveAttempted true to show error state
    }
  };

  // Handle input changes with validation on change
  const handleInputChange = (index, field, value) => {
    updateEducation(index, field, value);
    // Touch only this specific field immediately when user starts typing
    const fieldName = `education_${index}_${field}`;
    handleFieldTouch(fieldName);

    if (field === "startDate") {
      handleFieldTouch(`education_${index}_endDate`);
    } else if (field === "endDate") {
      handleFieldTouch(`education_${index}_startDate`);
    }
  };

  // Enhanced add education to track changes
  const handleAddEducation = () => {
    const newEdu = {
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    setProfileData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  // Enhanced remove education to track changes
  const handleRemoveEducation = async (index) => {
    await showConfirmation({
      title: "Delete Education",
      message:
        "Are you sure you want to delete this education entry? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    setProfileData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Update education function
  const updateEducation = (index, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Determine save button state with better logic
  const canSave = hasChanges && formsValid.education && !isSaving;
  const showSuccess = lastSaveTime && !hasChanges && !isSaving;

  const getSaveButtonState = () => {
    if (isSaving)
      return {
        text: "Saving...",
        icon: Loader2,
        className: "bg-blue-500 text-white cursor-wait",
        disabled: true,
      };
    if (showSuccess)
      return {
        text: "Saved",
        icon: Check,
        className: "bg-green-600 text-white cursor-default",
        disabled: true,
      };
    if (!hasChanges)
      return {
        text: "No Changes",
        icon: Save,
        className: "bg-gray-300 text-gray-500 cursor-pointer",
        disabled: false,
      };
    if (!formsValid.education)
      return {
        text: "Save Changes",
        icon: Save,
        className:
          "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 cursor-pointer",
        disabled: false,
      };
    return {
      text: "Save Changes",
      icon: Save,
      className:
        "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 cursor-pointer",
      disabled: false,
    };
  };

  const saveButtonState = getSaveButtonState();

  // Enhanced tooltip component with responsive positioning
  const SaveButtonTooltip = ({
    show,
    children,
    message = "You haven't made any changes",
  }) => (
    <div className="relative inline-block w-full sm:w-auto">
      {children}
      {show && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg z-50 min-w-max"
          style={{
            animation: "fadeIn 0.2s ease-out",
            opacity: 1,
            transform: "translate(-50%, 0)",
            maxWidth: "90vw",
          }}
        >
          <div className="relative whitespace-nowrap sm:whitespace-normal sm:max-w-xs sm:text-center">
            {message}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );

  // Auto-hide tooltip logic
  const handleTooltipEnter = () => {
    if (!canSave && !hasChanges) {
      setShowTooltip(true);
    }
  };

  const handleTooltipLeave = () => {
    setShowTooltip(false);
  };

  // Enhanced read-only education card with responsive design
  const EducationCard = ({ edu, index }) => (
    <div className="group p-4 sm:p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-3 sm:space-y-0">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors self-center sm:self-start">
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-2 space-y-2 sm:space-y-0">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 break-words">
                {edu.degree}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">{edu.school}</span>
                </div>
                {edu.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="break-words">{edu.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {edu.description && (
            <p className="text-gray-700 leading-relaxed text-sm break-words">
              {edu.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-slate-200 w-full max-w-none">
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

      {/* Header Section - Responsive */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">
            Education
          </h2>
          <div className="flex items-center space-x-2">
            {editingSections.education && hasChanges && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs animate-pulse-custom">
                <Info className="w-3 h-3" />
                <span className="hidden sm:inline">Unsaved changes</span>
                <span className="sm:hidden">Unsaved</span>
              </div>
            )}
            {editingSections.education && showSuccess && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs animate-fade-in">
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Changes saved</span>
                <span className="sm:hidden">Saved</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-row lg:gap-2 w-full sm:w-auto lg:w-auto">
          <button
            onClick={() => handleToggleEdit("education")}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 cursor-pointer rounded-lg transition-all duration-200 text-sm sm:text-base font-medium w-full sm:w-auto sm:min-w-[120px] order-1 ${
              editingSections.education
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-slate-600 text-white hover:bg-slate-700"
            }`}
          >
            {editingSections.education ? (
              <X className="w-4 h-4" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
            <span>{editingSections.education ? "Cancel" : "Edit"}</span>
          </button>
          {editingSections.education && (
            <button
              onClick={handleAddEducation}
              className="flex items-center justify-center cursor-pointer space-x-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:shadow-md transform hover:scale-105 text-sm sm:text-base font-medium w-full sm:w-auto sm:min-w-[120px] order-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Education</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
          {editingSections.education && (
            <SaveButtonTooltip
              show={showTooltip}
              message={
                !hasChanges
                  ? "You haven't made any changes"
                  : !formsValid.education
                  ? "Click to see validation errors"
                  : "Ready to save your changes"
              }
            >
              <button
                ref={tooltipRef}
                onClick={handleSave}
                disabled={saveButtonState.disabled}
                onMouseEnter={handleTooltipEnter}
                onMouseLeave={handleTooltipLeave}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium w-full sm:w-auto sm:min-w-[120px] order-3 ${saveButtonState.className}`}
              >
                {saveButtonState.icon === Loader2 ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveButtonState.icon === Check ? (
                  <Check
                    className="w-4 h-4"
                    style={{ animation: "bounce 0.6s ease-in-out" }}
                  />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{saveButtonState.text}</span>
                <span className="sm:hidden">
                  {saveButtonState.text.includes("Saving")
                    ? "Saving..."
                    : saveButtonState.text.includes("Saved")
                    ? "Saved"
                    : saveButtonState.text.includes("Save")
                    ? "Save"
                    : "Save"}
                </span>
              </button>
            </SaveButtonTooltip>
          )}
        </div>
      </div>

      {/* Main Content - Responsive */}
      {profileData.education.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No education added yet
          </h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base px-4">
            Add your educational background to showcase your qualifications
          </p>
          {editingSections.education && (
            <button
              onClick={handleAddEducation}
              className="inline-flex cursor-pointer items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Education</span>
            </button>
          )}
        </div>
      ) : editingSections.education ? (
        <div className="space-y-4 sm:space-y-6">
          {profileData.education.map((edu, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                <h3 className="font-medium text-gray-900 text-lg break-words">
                  {edu.degree || "New Education"}{" "}
                  {edu.school && `at ${edu.school}`}
                </h3>
                <button
                  onClick={() => handleRemoveEducation(index)}
                  className="text-red-500 cursor-pointer hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 self-start sm:self-center"
                  title="Delete education"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree/Certification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) =>
                      handleInputChange(index, "degree", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 placeholder:text-gray-500 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                      hasFieldError(`education_${index}_degree`)
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g. Bachelor of Science in Computer Science"
                  />
                  {hasFieldError(`education_${index}_degree`) && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                      <Info className="w-3 h-3 flex-shrink-0" />
                      <span>{getFieldError(`education_${index}_degree`)}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <UniversityAutocomplete
                    value={edu.school}
                    onChange={(value) =>
                      handleInputChange(index, "school", value)
                    }
                    placeholder="e.g. Stanford University"
                    hasError={hasFieldError(`education_${index}_school`)}
                  />
                  {hasFieldError(`education_${index}_school`) && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                      <Info className="w-3 h-3 flex-shrink-0" />
                      <span>{getFieldError(`education_${index}_school`)}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <LocationAutocomplete
                    value={edu.location}
                    onChange={(value) =>
                      handleInputChange(index, "location", value)
                    }
                    placeholder="e.g. Stanford, CA"
                    hasError={hasFieldError(`education_${index}_location`)}
                  />
                  {hasFieldError(`education_${index}_location`) && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                      <Info className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {getFieldError(`education_${index}_location`)}
                      </span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <CustomDateInput
                    value={edu.startDate}
                    onChange={(e) =>
                      handleInputChange(index, "startDate", e.target.value)
                    }
                    placeholder="Select start date"
                    hasError={
                      hasFieldError(`education_${index}_startDate`) ||
                      hasDateRangeError(index)
                    }
                  />
                  {hasFieldError(`education_${index}_startDate`) && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                      <Info className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {getFieldError(`education_${index}_startDate`)}
                      </span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {edu.endDate && new Date(edu.endDate + "-01") > new Date()
                      ? "Expected End Date"
                      : "End Date"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <CustomDateInput
                    value={edu.endDate}
                    onChange={(e) =>
                      handleInputChange(index, "endDate", e.target.value)
                    }
                    placeholder={
                      edu.endDate && new Date(edu.endDate + "-01") > new Date()
                        ? "Expected completion date"
                        : "Select end date"
                    }
                    hasError={
                      hasFieldError(`education_${index}_endDate`) ||
                      hasDateRangeError(index)
                    }
                  />
                  {hasFieldError(`education_${index}_endDate`) && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                      <Info className="w-3 h-3 flex-shrink-0" />
                      <span>{getFieldError(`education_${index}_endDate`)}</span>
                    </p>
                  )}
                  {hasDateRangeError(index) && (
                    <div className="mb-4">
                      <p className="text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        <span>{getDateRangeError(index)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={edu.description}
                  onChange={(e) =>
                    handleInputChange(index, "description", e.target.value)
                  }
                  className={`w-full placeholder:text-gray-500 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm sm:text-base ${
                    hasFieldError(`education_${index}_description`)
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Additional details, achievements, relevant coursework, GPA, honors, etc..."
                ></textarea>
                {hasFieldError(`education_${index}_description`) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1 animate-slide-down">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span>
                      {getFieldError(`education_${index}_description`)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {profileData.education.map((edu, index) => (
            <EducationCard key={index} edu={edu} index={index} />
          ))}
        </div>
      )}
      <ConfirmationModal />
    </div>
  );
};

export default EducationSection;
