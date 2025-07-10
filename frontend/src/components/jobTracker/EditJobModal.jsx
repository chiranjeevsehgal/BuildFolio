import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  RefreshCw,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  Briefcase,
  FileText,
  Bot,
  Link as LinkIcon,
  User,
  Mail,
  Phone,
  Clock,
  Target,
  Edit3,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import { useConfirmationModal } from "../ConfirmationModal";

const EditJobModal = ({ job, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    status: "applied",
    priority: "medium",
    jobUrl: "",
    description: "",
    appliedDate: "",
    recruiterName: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const { showConfirmation, ConfirmationModal } = useConfirmationModal();

  const statusOptions = [
    { value: "applied", label: "Applied", color: "blue" },
    { value: "interview", label: "Interview Scheduled", color: "yellow" },
    { value: "in-progress", label: "In Progress", color: "purple" },
    { value: "offer", label: "Offer Received", color: "green" },
    { value: "rejected", label: "Rejected", color: "red" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low Priority", color: "green" },
    { value: "medium", label: "Medium Priority", color: "yellow" },
    { value: "high", label: "High Priority", color: "red" },
  ];

  // Initialize form data when job changes
  useEffect(() => {
    if (job && isOpen) {
      const initialData = {
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        salary: job.salary || "",
        status: job.status || "applied",
        priority: job.priority || "medium",
        jobUrl: job.jobUrl || "",
        description: job.description || "",
        appliedDate: job.appliedDate || new Date().toISOString().split("T")[0],
        recruiterName: job.recruiterName || "",
        contactEmail: job.contactEmail || "",
        contactPhone: job.contactPhone || "",
        notes: job.notes || "",
      };
      setFormData(initialData);
      setHasChanges(false);
      setErrors({});
    }
  }, [job, isOpen]);

  // Track changes
  useEffect(() => {
    if (job) {
      const hasAnyChanges = Object.keys(formData).some((key) => {
        return formData[key] !== (job[key] || "");
      });
      setHasChanges(hasAnyChanges);
    }
  }, [formData, job]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!formData.appliedDate) {
      newErrors.appliedDate = "Application date is required";
    }

    if (
      formData.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)
    ) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    if (formData.jobUrl && !formData.jobUrl.startsWith("http")) {
      newErrors.jobUrl =
        "Please enter a valid URL (starting with http:// or https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsLoading(true);
    try {
      onSave({ ...job, ...formData });
      onClose();
    } catch (error) {
      console.error("Failed to update job:", error);
      toast.error("Failed to update job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    if (hasChanges) {
      try {
        await showConfirmation({
          title: "Unsaved Changes",
          message: "You have unsaved changes. Are you sure you want to cancel?",
          confirmText: "Yes, Cancel",
          cancelText: "Keep Editing",
          type: "warning",
        });
        onClose();
      } catch (error) {
        // User cancelled, do nothing
      }
    } else {
      onClose();
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-3 sm:p-4 lg:p-6 rounded-t-xl sm:rounded-t-2xl z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 flex items-center">
                <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                <span className="truncate">Edit Job Application</span>
              </h3>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                <span className="hidden sm:inline">Update details for </span>
                <span className="font-medium">{job?.title}</span>
                <span className="hidden sm:inline"> at {job?.company}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {hasChanges && (
                <div className="flex items-center text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 rounded-full">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                    Unsaved changes
                  </span>
                  <span className="text-xs font-medium sm:hidden">Changes</span>
                </div>
              )}
              <button
                onClick={handleClose}
                className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Basic Information */}
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
            <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
              Basic Information
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Job Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border placeholder:!text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.title
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                  placeholder="e.g. Senior Frontend Developer"
                />
                {errors.title && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Company <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className={`w-full px-3 py-2 border placeholder:!text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.company
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                  placeholder="e.g. Google"
                />
                {errors.company && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">
                    {errors.company}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 border placeholder:!text-gray-400 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g. Bangalore, India"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Salary Range
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) =>
                      handleInputChange("salary", e.target.value)
                    }
                    className="w-full pl-9 sm:pl-10 pr-3 placeholder:!text-gray-400 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g. 12 LPA - 16 LPA"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Applied Date <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) =>
                      handleInputChange("appliedDate", e.target.value)
                    }
                    className={`w-full pl-9 sm:pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                      errors.appliedDate
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                  />
                </div>
                {errors.appliedDate && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">
                    {errors.appliedDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
            <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
              Job Details
            </h4>

            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                Job URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
                <input
                  type="url"
                  value={formData.jobUrl}
                  onChange={(e) => handleInputChange("jobUrl", e.target.value)}
                  className={`w-full pl-9 sm:pl-10 pr-3 py-2 border placeholder:!text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.jobUrl
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                  placeholder="https://careers.company.com/job/123"
                />
              </div>
              {errors.jobUrl && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">
                  {errors.jobUrl}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-700">
                  Job Description
                </label>
              </div>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border placeholder:!text-gray-400 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Paste the job description here for AI analysis..."
              />
              <p className="text-xs text-slate-500 mt-1 sm:mt-2">
                AI will analyze this to provide updated resume suggestions
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
            <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
              Contact Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Recruiter Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="text"
                    value={formData.recruiterName}
                    onChange={(e) =>
                      handleInputChange("recruiterName", e.target.value)
                    }
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 border placeholder:!text-gray-400 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Contact Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      handleInputChange("contactEmail", e.target.value)
                    }
                    className={`w-full pl-9 sm:pl-10 pr-3 py-2 border placeholder:!text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                      errors.contactEmail
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                    placeholder="recruiter@company.com"
                  />
                </div>
                {errors.contactEmail && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">
                    {errors.contactEmail}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      handleInputChange("contactPhone", e.target.value)
                    }
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 border placeholder:!text-gray-400 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="+91 9988776655"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Notes */}
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
            <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
              Personal Notes
            </h4>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg placeholder:!text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              placeholder="Add your personal notes about this application..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-3 sm:p-4 lg:p-6 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="order-2 sm:order-1 flex-1 bg-slate-200 cursor-pointer hover:bg-slate-300 text-slate-700 px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="order-1 sm:order-2 flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <ConfirmationModal />
    </div>
  );
};

export default EditJobModal;
