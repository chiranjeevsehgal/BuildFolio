import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const PasswordChangeModal = ({
  showPasswordModal,
  setShowPasswordModal,
  setLoading,
  loading,
  showMessage: showMessageParent,
}) => {
  if (!showPasswordModal) return null;

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const showLocalMessage = useCallback((type, content) => {
    if (type === "success") {
      toast.success(content);
    } else if (type === "error") {
      toast.error(content);
    } else if (type === "warning") {
      toast(content, {
        icon: "ℹ️",
      });
    }
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Set up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const handleInputChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const confirmPasswordChange = async () => {
    // Validation
    if (!passwordData.currentPassword.trim()) {
      showLocalMessage("warning", "Please enter your current password.");
      return;
    }

    if (!passwordData.newPassword.trim()) {
      showLocalMessage("warning", "Please enter a new password.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showLocalMessage(
        "warning",
        "New password must be at least 8 characters long.",
      );
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showLocalMessage("warning", "New passwords do not match.");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      showLocalMessage(
        "warning",
        "New password must be different from your current password.",
      );
      return;
    }

    setLoading((prev) => ({ ...prev, action: "password" }));

    try {
      const response = await axios.put(
        "/profiles/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        // Close modal and clear form
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        if (showMessageParent) {
          showMessageParent("success", "Password changed successfully.");
        }
      } else {
        throw new Error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change failed:", error);

      let errorMessage = "Failed to change password. Please try again.";

      if (error.response?.status === 400) {
        if (
          error.response.data.errors &&
          Array.isArray(error.response.data.errors)
        ) {
          errorMessage = error.response.data.errors
            .map((err) => err.message || err.msg)
            .join(", ");
        } else {
          errorMessage =
            error.response.data.message || "Invalid password data provided.";
        }
        showLocalMessage("error", errorMessage);
      } else if (error.response?.status === 401) {
        errorMessage = "Current password is incorrect.";
        showLocalMessage("error", errorMessage);
      } else if (error.response?.status === 403) {
        errorMessage = "You do not have permission to change password.";
        showLocalMessage("error", errorMessage);
      } else {
        showLocalMessage("error", errorMessage);
      }
    } finally {
      setLoading((prev) => ({ ...prev, action: "" }));
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Change Password
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Enter your current password and choose a new secure password.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                placeholder="Enter current password"
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading.action === "password"}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                disabled={loading.action === "password"}
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                placeholder="Enter new password (min 8 characters)"
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading.action === "password"}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                disabled={loading.action === "password"}
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="Confirm new password"
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading.action === "password"}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                disabled={loading.action === "password"}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCloseModal}
            disabled={loading.action === "password"}
            className="flex-1 py-3 px-4 border cursor-pointer border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={confirmPasswordChange}
            disabled={loading.action === "password"}
            className="flex-1 py-3 px-4 bg-blue-600 cursor-pointer text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.action === "password" ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Changing...
              </div>
            ) : (
              "Change Password"
            )}
          </button>
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={true} />
    </div>
  );
};

export default PasswordChangeModal;
