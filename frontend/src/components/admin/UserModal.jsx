import { useState, useEffect } from "react";
import {
  User,
  X,
  Edit3,
  Ban,
  Send,
  ExternalLink,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Globe,
  Briefcase,
  UserCheck,
} from "lucide-react";

const UserModal = ({
  user,
  isOpen,
  onClose,
  getStatusConfig,
  getSubscriptionBadge,
}) => {
  if (!isOpen || !user) return null;

  const statusConfig = getStatusConfig(user.isActive);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user.fullName || "User Details"}
                </h2>
                <p className="text-blue-100">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* User Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-xl border ${statusConfig.color}`}
              >
                <StatusIcon className="w-4 h-4" />
                <span className="font-medium">{statusConfig.label}</span>
              </div>
              <div
                className={`px-3 py-1 rounded-xl font-medium text-sm ${getSubscriptionBadge(user.subscriptionType)}`}
              >
                {user.subscriptionType?.charAt(0).toUpperCase() +
                  user.subscriptionType?.slice(1)}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{user.email}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Join Date
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              {user.location && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Location
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user.location}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Last Active
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "NA"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Template
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {user.selectedTemplate || "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Status */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Portfolio Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${user.portfolioDeployed ? "bg-green-500" : "bg-gray-300"}`}
                ></div>
                <span className="text-sm text-gray-600">
                  {user.portfolioDeployed ? "Deployed" : "Not Deployed"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${user.isProfileCompleted ? "bg-green-500" : "bg-yellow-500"}`}
                ></div>
                <span className="text-sm text-gray-600">
                  {user.isProfileCompleted
                    ? "Profile Complete"
                    : "Profile Incomplete"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <Edit3 className="w-4 h-4" />
              <span>Edit User</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>

            {user.portfolioDeployed && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                <ExternalLink className="w-4 h-4" />
                <span>View Portfolio</span>
              </button>
            )}

            {user.isActive ? (
              <button
                onClick={() => {
                  updateUserStatus(user._id, "suspend");
                  onClose();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <Ban className="w-4 h-4" />
                <span>Suspend</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  updateUserStatus(user._id, "activate");
                  onClose();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Activate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
