import React, { useState } from "react";
import {
  X,
  Plus,
  Bot,
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  Briefcase,
  FileText,
  User,
  Mail,
  Phone,
  Link as LinkIcon,
  Save,
  RefreshCw,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";

const AddJobModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    status: "applied",
    priority: "medium",
    jobUrl: "",
    description: "",
    appliedDate: new Date().toISOString().split("T")[0], // Today's date
    recruiterName: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
    aiSuggestions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "applied", label: "Applied" },
    { value: "interview", label: "Interview Scheduled" },
    { value: "in-progress", label: "In Progress" },
    { value: "offer", label: "Offer Received" },
    { value: "rejected", label: "Rejected" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
  ];

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

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!formData.appliedDate) {
      newErrors.appliedDate = "Application date is required";
    }

    // Email validation
    if (
      formData.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)
    ) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    // URL validation
    if (formData.jobUrl && !formData.jobUrl.startsWith("http")) {
      newErrors.jobUrl =
        "Please enter a valid URL (starting with http:// or https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    try {
      // Clean and prepare data for API
      const jobData = {
        ...formData,
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        salary: formData.salary.trim(),
        jobUrl: formData.jobUrl.trim(),
        description: formData.description.trim(),
        recruiterName: formData.recruiterName.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        notes: formData.notes.trim(),
        aiSuggestions: formData.aiSuggestions.filter((suggestion) =>
          suggestion.trim(),
        ),
      };

      await onSave(jobData);

      // Reset form on success
      resetForm();
    } catch (error) {
      console.error("Failed to add job:", error);
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      salary: "",
      status: "applied",
      priority: "medium",
      jobUrl: "",
      description: "",
      appliedDate: new Date().toISOString().split("T")[0],
      recruiterName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
      aiSuggestions: [],
    });
    setErrors({});
  };

  const handleClose = () => {
    const hasData = Object.values(formData).some((value) =>
      typeof value === "string" ? value.trim() : value,
    );

    if (hasData && (formData.title.trim() || formData.company.trim())) {
      if (
        confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-3 sm:p-4 lg:p-6 rounded-t-xl sm:rounded-t-2xl z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 flex items-center">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                <span className="truncate">Add New Job Application</span>
              </h3>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                Track your job application with AI-powered insights
              </p>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 hover:bg-slate-100 cursor-pointer rounded-lg transition-colors flex-shrink-0"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8"
        >
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
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    className={`w-full pl-9 sm:pl-10 pr-3 placeholder:!text-gray-400 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                      errors.company
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                    placeholder="e.g. Google"
                  />
                </div>
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
                    className="w-full pl-9 sm:pl-10 pr-3 placeholder:!text-gray-400 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                    className="w-full pl-9 sm:pl-10 placeholder:!text-gray-400 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className={`w-full pl-9 sm:pl-10 placeholder:!text-gray-400 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
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
                AI will analyze this to provide resume suggestions
              </p>
            </div>

            {/* AI Suggestions Preview */}
            {formData.aiSuggestions.length > 0 && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h5 className="font-medium text-purple-800 mb-2 flex items-center text-sm sm:text-base">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  AI Suggestions ({formData.aiSuggestions.length})
                </h5>
                <div className="space-y-1">
                  {formData.aiSuggestions
                    .slice(0, 3)
                    .map((suggestion, index) => (
                      <p
                        key={index}
                        className="text-purple-700 text-xs sm:text-sm"
                      >
                        • {suggestion}
                      </p>
                    ))}
                  {formData.aiSuggestions.length > 3 && (
                    <p className="text-purple-600 text-xs sm:text-sm">
                      + {formData.aiSuggestions.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}
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
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 placeholder:!text-gray-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 placeholder:!text-gray-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="+91 9988912981"
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
              className="w-full px-3 py-2 border placeholder:!text-gray-400 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              placeholder="Add your personal notes about this application..."
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-3 sm:p-4 lg:p-6 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="order-2 sm:order-1 flex-1 bg-slate-200 hover:bg-slate-300 cursor-pointer text-slate-700 px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="order-1 sm:order-2 flex-1 bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  <span>Adding Job...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span>Add Job Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddJobModal;
