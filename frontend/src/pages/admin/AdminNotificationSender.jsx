import { useState, useEffect } from "react";
import { Send, Users, User, CheckCircle, AlertCircle, X } from "lucide-react";
import axios from "axios";

const AdminNotificationSender = () => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    isGlobal: false,
    userIds: "",
    actionUrl: "",
    actionText: "",
    priority: "medium",
    expiresIn: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch all users for selection
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/admin/users");
      if (response.data.success) {
        setAllUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        userIds: formData.isGlobal ? [] : selectedUsers.map((user) => user._id),
      };

      const response = await axios.post("/notifications/send", payload);

      if (response.data.success) {
        setMessage({
          type: "success",
          content: response.data.message,
        });

        // Reset form
        setFormData({
          title: "",
          message: "",
          type: "info",
          isGlobal: false,
          userIds: "",
          actionUrl: "",
          actionText: "",
          priority: "medium",
          expiresIn: "",
        });
        setSelectedUsers([]);
      }
    } catch (error) {
      setMessage({
        type: "error",
        content: error.response?.data?.message || "Failed to send notification",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    const isSelected = selectedUsers.find((u) => u._id === user._id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const sendBulkNotification = async (filters) => {
    try {
      setLoading(true);
      const response = await axios.post("/notifications/bulk", {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        filters,
        actionUrl: formData.actionUrl,
        actionText: formData.actionText,
        priority: formData.priority,
      });

      if (response.data.success) {
        setMessage({
          type: "success",
          content: response.data.message,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        content:
          error.response?.data?.message || "Failed to send bulk notification",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center mb-6">
        <Send className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Send Notification</h2>
      </div>

      {/* Message Toast */}
      {message.content && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.content}
          </div>
          <button
            onClick={() => setMessage({ type: "", content: "" })}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Notification title"
            required
            maxLength={100}
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Notification message"
            required
            maxLength={500}
          />
        </div>

        {/* Type and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Audience
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="audience"
                checked={formData.isGlobal}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, isGlobal: true }))
                }
                className="mr-3"
              />
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              <span>All Users</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="audience"
                checked={!formData.isGlobal}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, isGlobal: false }))
                }
                className="mr-3"
              />
              <User className="w-5 h-5 mr-2 text-green-500" />
              <span>Specific Users</span>
            </label>
          </div>
        </div>

        {/* User Selection */}
        {!formData.isGlobal && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Users
            </label>
            <div className="border border-gray-300 rounded-xl p-3">
              {selectedUsers.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Selected Users ({selectedUsers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <span
                        key={user._id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {user.firstName} {user.lastName}
                        <button
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowUserSelector(!showUserSelector)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showUserSelector ? "Hide" : "Show"} User List
              </button>

              {showUserSelector && (
                <div className="mt-3 max-h-40 overflow-y-auto">
                  {allUsers.map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center py-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.find((u) => u._id === user._id)
                            ? true
                            : false
                        }
                        onChange={() => handleUserSelect(user)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {user.email}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action URL and Text */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action URL (Optional)
            </label>
            <input
              type="url"
              value={formData.actionUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Text (Optional)
            </label>
            <input
              type="text"
              value={formData.actionText}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, actionText: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Learn More"
            />
          </div>
        </div>

        {/* Expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expires After (Optional)
          </label>
          <select
            value={formData.expiresIn}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, expiresIn: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Never</option>
            <option value="24">24 Hours</option>
            <option value="72">3 Days</option>
            <option value="168">1 Week</option>
            <option value="720">1 Month</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: "",
                message: "",
                type: "info",
                isGlobal: false,
                userIds: "",
                actionUrl: "",
                actionText: "",
                priority: "medium",
                expiresIn: "",
              });
              setSelectedUsers([]);
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={loading || !formData.title || !formData.message}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Actions */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => sendBulkNotification({ portfolioDeployed: true })}
            disabled={loading || !formData.title || !formData.message}
            className="p-4 border border-green-200 rounded-xl hover:bg-green-50 text-green-700 font-medium disabled:opacity-50"
          >
            Send to Users with Live Portfolios
          </button>

          <button
            onClick={() => sendBulkNotification({ portfolioDeployed: false })}
            disabled={loading || !formData.title || !formData.message}
            className="p-4 border border-yellow-200 rounded-xl hover:bg-yellow-50 text-yellow-700 font-medium disabled:opacity-50"
          >
            Send to Users without Portfolios
          </button>

          <button
            onClick={() => sendBulkNotification({ isProfileCompleted: false })}
            disabled={loading || !formData.title || !formData.message}
            className="p-4 border border-red-200 rounded-xl hover:bg-red-50 text-red-700 font-medium disabled:opacity-50"
          >
            Send to Users with Incomplete Profiles
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationSender;
