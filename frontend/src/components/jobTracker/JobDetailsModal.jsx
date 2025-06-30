import React, { useState, useEffect } from 'react';
import {
  XCircle, ExternalLink, Edit3, Trash2, Calendar, MapPin,
  DollarSign, Building2, AlertCircle, Bot, Copy, Star,
  Clock, Target, Briefcase, FileText, Users, CheckCircle,
  MoreVertical, Link as LinkIcon, Phone, Mail, User,
  IndianRupee,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useConfirmationModal } from '../ConfirmationModal';
import AIInsightsModal from './AIInsightsModal';

const JobDetailsModal = ({ job, isOpen, onClose, onEdit, onDelete, onStatusChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [currentJobStatus, setCurrentJobStatus] = useState(job?.status);
  const { showConfirmation, ConfirmationModal } = useConfirmationModal();

  useEffect(() => {
    if (job?.status) {
      setCurrentJobStatus(job.status);
    }
  }, [job?.status]);

  if (!isOpen || !job) return null;

  const statusOptions = [
    { id: 'applied', label: 'Applied', color: 'blue', icon: FileText },
    { id: 'interview', label: 'Interview Scheduled', color: 'yellow', icon: Users },
    { id: 'in-progress', label: 'In Progress', color: 'purple', icon: Clock },
    { id: 'offer', label: 'Offer Received', color: 'green', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', color: 'red', icon: XCircle },
  ];

  const currentStatus = statusOptions.find(status => status.id === currentJobStatus);

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { color: 'bg-red-100 text-red-800 border-red-200', label: 'High Priority' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Medium Priority' },
      low: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Low Priority' },
    };
    return config[priority] || config.low;
  };

  const getStatusBadge = (status) => {
    const config = {
      applied: { color: 'bg-blue-100 text-blue-800 border-blue-200' },
      interview: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'in-progress': { color: 'bg-purple-100 text-purple-800 border-purple-200' },
      offer: { color: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200' },
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
        }
      });
    } catch (error) {
      // User cancelled or error occurred
      console.log('Delete cancelled or failed');
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    setCurrentJobStatus(newStatus);
    setShowDropdown(false);

    try {
      await onStatusChange(jobId, newStatus);
    } catch (error) {
      setCurrentJobStatus(job.status);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-slate-800">{job.title}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityBadge(job.priority).color}`}>
                  {getPriorityBadge(job.priority).label}
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  <span className="font-medium">{job.company}</span>
                </div>
                {job.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Applied {new Date(job.appliedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Job Posting Button */}
              <button
                onClick={() => job.jobUrl && window.open(job.jobUrl, '_blank')}
                disabled={!job.jobUrl}
                title={!job.jobUrl ? 'No job URL available' : 'View job posting'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${job.jobUrl
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <ExternalLink className="w-4 h-4" />
                View Job
              </button>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg font-medium border transition-colors ${getStatusBadge(currentJobStatus).color}`}
                >
                  {currentStatus && <currentStatus.icon className="w-4 h-4" />}
                  {currentStatus?.label}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-10">
                    {statusOptions.map((status) => {
                      const IconComponent = status.icon;
                      return (
                        <button
                          key={status.id}
                          onClick={() => {
                            handleStatusChange(job._id, status.id);
                          }}
                          className={`w-full flex cursor-pointer items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 transition-colors ${status.id === currentJobStatus ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                            }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          {status.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm font-medium">Salary Range</span>
              </div>
              <div className="flex items-center">
                <IndianRupee className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-semibold text-slate-800">{job.salary || 'Not specified'}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <span className="text-slate-600 text-sm font-medium block mb-2">Application Date</span>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-semibold text-slate-800">
                  {new Date(job.appliedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <span className="text-slate-600 text-sm font-medium block mb-2">Days Since Applied</span>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-purple-600" />
                <span className="font-semibold text-slate-800">
                  {Math.floor((new Date() - new Date(job.appliedDate)) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Job Description
            </h4>
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {job.description || 'No description available'}
              </p>
            </div>
          </div>

          {/* AI Suggestions */}
          {job.aiSuggestions && job.aiSuggestions.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-purple-600" />
                AI Resume Suggestions
                <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  {job.aiSuggestions.length} tips
                </span>
              </h4>
              <div className="space-y-3">
                {job.aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-lg p-4 flex items-start">
                    <div className="bg-purple-100 rounded-full p-1 mr-3 mt-0.5">
                      <Target className="w-3 h-3 text-purple-600" />
                    </div>
                    <p className="text-purple-800 text-sm flex-1">{suggestion}</p>
                    <button
                      onClick={() => copyToClipboard(suggestion, 'Suggestion')}
                      className="p-1 hover:bg-purple-100 rounded transition-colors ml-2"
                    >
                      <Copy className="w-3 h-3 text-purple-600" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                Get New AI Suggestions
              </button>
            </div>
          )}

          {/* Notes Section */}
          <div className="bg-slate-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-slate-600" />
                Personal Notes
              </h4>
            </div>
            <div className="text-slate-700">
              {job.notes ? (
                <p className="whitespace-pre-wrap leading-relaxed">{job.notes}</p>
              ) : (
                <p className="text-slate-500 italic">No notes added yet.</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(job.contactEmail || job.contactPhone || job.recruiterName) && (
            <div className="bg-slate-50 rounded-xl p-6">
              <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-slate-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {job.recruiterName && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="text-slate-700">{job.recruiterName}</span>
                  </div>
                )}
                {job.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                    <a
                      href={`mailto:${job.contactEmail}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {job.contactEmail}
                    </a>
                  </div>
                )}
                {job.contactPhone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                    <a
                      href={`tel:${job.contactPhone}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
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
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-6 rounded-b-2xl">
          <div className="flex flex-wrap gap-3">
            {/* AI Insights Button */}
            <button
              onClick={() => setShowAIModal(true)}
              className="flex-1 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors cursor-pointer justify-center"
            >
              <Bot className="w-4 h-4" />
              AI Insights
            </button>

            <button
              onClick={() => onEdit(job)}
              className="flex-1 cursor-pointer bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Details
            </button>
            
            <button
              onClick={handleDelete}
              className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
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