import React, { useState, useEffect } from "react";
import {
  XCircle,
  ExternalLink,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  AlertCircle,
  Bot,
  Copy,
  Star,
  Clock,
  Target,
  Briefcase,
  FileText,
  Users,
  CheckCircle,
  MoreVertical,
  Link as LinkIcon,
  Phone,
  Mail,
  User,
  IndianRupee,
  ChevronDown,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useConfirmationModal } from "../ConfirmationModal";
import AIInsightsModal from "./AIInsightsModal";

const JobDetailsModal = ({
  job,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [currentJobStatus, setCurrentJobStatus] = useState(job?.status);
  const { showConfirmation, ConfirmationModal } = useConfirmationModal();

  useEffect(() => {
    if (job?.status) {
      setCurrentJobStatus(job.status);
    }
  }, [job?.status]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  if (!isOpen || !job) return null;

  const statusOptions = [
    { id: "applied", label: "Applied", color: "blue", icon: FileText },
    {
      id: "interview",
      label: "Interview Scheduled",
      color: "yellow",
      icon: Users,
    },
    { id: "in-progress", label: "In Progress", color: "purple", icon: Clock },
    { id: "offer", label: "Offer Received", color: "green", icon: CheckCircle },
    { id: "rejected", label: "Rejected", color: "red", icon: XCircle },
  ];

  const currentStatus = statusOptions.find(
    (status) => status.id === currentJobStatus,
  );

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "High Priority",
      },
      medium: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Medium Priority",
      },
      low: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Low Priority",
      },
    };
    return config[priority] || config.low;
  };

  const getStatusBadge = (status) => {
    const config = {
      applied: { color: "bg-blue-100 text-blue-800 border-blue-200" },
      interview: { color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      "in-progress": {
        color: "bg-purple-100 text-purple-800 border-purple-200",
      },
      offer: { color: "bg-green-100 text-green-800 border-green-200" },
      rejected: { color: "bg-red-100 text-red-800 border-red-200" },
    };
    return config[status] || config.applied;
  };

  const handleDelete = async () => {
    try {
      await showConfirmation({
        title: "Delete Job Application",
        message: `Are you sure you want to delete the application for ${job.title} at ${job.company}? This action cannot be undone.`,
        confirmText: "Yes, Delete",
        cancelText: "Cancel",
        type: "danger",
        onConfirm: async () => {
          await onDelete(job._id);
          onClose();
        },
      });
    } catch (error) {
      // User cancelled or error occurred
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    setCurrentJobStatus(newStatus);
    setShowDropdown(false);

    try {
      await onStatusChange(jobId, newStatus);
    } catch (error) {
      setCurrentJobStatus(job.status);
      toast.error("Failed to update status");
    }
  };

  // Check if job description exists and is not empty
  const hasJobDescription =
    job.description && job.description.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-3 sm:p-4 lg:p-6 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-2">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
                  {job.title}
                </h3>
                <div
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getPriorityBadge(job.priority).color} flex-shrink-0`}
                >
                  {getPriorityBadge(job.priority).label}
                </div>
              </div>

              {/* Company and location info - responsive layout */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600 text-sm">
                <div className="flex items-center min-w-0">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="font-medium truncate">{job.company}</span>
                </div>
                {job.location && (
                  <div className="flex items-center min-w-0">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    Applied {new Date(job.appliedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons - responsive */}
            <div className="flex items-start gap-1 sm:gap-2 flex-shrink-0">
              {/* View Job Button - hidden on mobile if no URL */}
              {job.jobUrl && (
                <button
                  onClick={() => window.open(job.jobUrl, "_blank")}
                  title="View job posting"
                  className="hidden sm:flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden lg:inline">View Job</span>
                </button>
              )}

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 cursor-pointer rounded-lg font-medium border transition-colors text-xs sm:text-sm ${getStatusBadge(currentJobStatus).color}`}
                >
                  {currentStatus && (
                    <currentStatus.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  )}
                  <span className="hidden sm:inline truncate">
                    {currentStatus?.label}
                  </span>
                  <span className="sm:hidden truncate">
                    {currentStatus?.label.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20">
                    {statusOptions.map((status) => {
                      const IconComponent = status.icon;
                      return (
                        <button
                          key={status.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(job._id, status.id);
                          }}
                          className={`w-full flex cursor-pointer items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-left hover:bg-slate-50 transition-colors text-sm ${
                            status.id === currentJobStatus
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700"
                          }`}
                        >
                          <IconComponent className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{status.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Close button - always visible */}
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                title="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Mobile View Job Button */}
          {job.jobUrl && (
            <div className="sm:hidden">
              <button
                onClick={() => window.open(job.jobUrl, "_blank")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Job Posting
              </button>
            </div>
          )}

          {/* Quick Info Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-xs sm:text-sm font-medium">
                  Salary Range
                </span>
              </div>
              <div className="flex items-center">
                <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                  {job.salary || "Not specified"}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <span className="text-slate-600 text-xs sm:text-sm font-medium block mb-2">
                Application Date
              </span>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-slate-800 text-sm sm:text-base">
                  {new Date(job.appliedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
              <span className="text-slate-600 text-xs sm:text-sm font-medium block mb-2">
                Days Since Applied
              </span>
              <div className="flex items-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-600 flex-shrink-0" />
                <span className="font-semibold text-slate-800 text-sm sm:text-base">
                  {Math.floor(
                    (new Date() - new Date(job.appliedDate)) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days
                </span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
              Job Description
            </h4>
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {job.description || "No description available"}
              </p>
            </div>
          </div>

          {/* AI Suggestions */}
          {job.aiSuggestions && job.aiSuggestions.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200">
              <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 flex-shrink-0" />
                AI Resume Suggestions
                <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  {job.aiSuggestions.length} tips
                </span>
              </h4>
              <div className="space-y-2 sm:space-y-3">
                {job.aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3"
                  >
                    <div className="bg-purple-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                      <Target className="w-2 h-2 sm:w-3 sm:h-3 text-purple-600" />
                    </div>
                    <p className="text-purple-800 text-xs sm:text-sm flex-1 leading-relaxed">
                      {suggestion}
                    </p>
                    <button
                      onClick={() => copyToClipboard(suggestion, "Suggestion")}
                      className="p-1 hover:bg-purple-100 rounded transition-colors flex-shrink-0"
                      title="Copy suggestion"
                    >
                      <Copy className="w-3 h-3 text-purple-600" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-3 sm:mt-4 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center text-sm">
                <Bot className="w-4 h-4 mr-2" />
                Get New AI Suggestions
              </button>
            </div>
          )}

          {/* Notes Section */}
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="font-semibold text-slate-800 flex items-center text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-600 flex-shrink-0" />
                Personal Notes
              </h4>
            </div>
            <div className="text-slate-700">
              {job.notes ? (
                <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {job.notes}
                </p>
              ) : (
                <p className="text-slate-500 italic text-sm sm:text-base">
                  No notes added yet.
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(job.contactEmail || job.contactPhone || job.recruiterName) && (
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-600 flex-shrink-0" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {job.recruiterName && (
                  <div className="flex items-center min-w-0">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-700 text-sm sm:text-base truncate">
                      {job.recruiterName}
                    </span>
                  </div>
                )}
                {job.contactEmail && (
                  <div className="flex items-center min-w-0">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-slate-400 flex-shrink-0" />
                    <a
                      href={`mailto:${job.contactEmail}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base truncate"
                    >
                      {job.contactEmail}
                    </a>
                  </div>
                )}
                {job.contactPhone && (
                  <div className="flex items-center min-w-0">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-slate-400 flex-shrink-0" />
                    <a
                      href={`tel:${job.contactPhone}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base truncate"
                    >
                      {job.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-3 sm:p-4 lg:p-6 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* AI Insights Button - Conditional */}
            <div className="relative flex-1">
              <button
                onClick={() => hasJobDescription && setShowAIModal(true)}
                disabled={!hasJobDescription}
                className={`w-full flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors justify-center text-sm sm:text-base ${
                  hasJobDescription
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                title={
                  hasJobDescription
                    ? "Get AI insights for this job"
                    : "Job description is required for AI insights"
                }
              >
                <Bot className="w-4 h-4" />
                AI Insights
              </button>

              {/* Tooltip for disabled state */}
              {!hasJobDescription && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Job description is needed for AI insights
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>

            <button
              onClick={() => onEdit(job)}
              className="flex-1 cursor-pointer bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center text-sm sm:text-base"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Details
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center sm:w-auto"
              title="Delete job application"
            >
              <Trash2 className="w-4 h-4" />
              <span className="ml-2 sm:hidden">Delete</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal />

        {/* AI Insights Modal */}
        <AIInsightsModal
          job={job}
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
        />
      </div>
    </div>
  );
};

export default JobDetailsModal;
