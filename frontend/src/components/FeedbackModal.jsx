import { useState } from "react";
import {
  X,
  ChevronDown,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const FeedbackModal = ({ isOpen, onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const topics = [
    "Bug Report",
    "Feature Request",
    "General Feedback",
    "UI/UX Improvement",
    "Performance Issue",
    "Other",
  ];

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Setting up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common["Content-Type"] = "application/json";

    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate rating
    if (rating === 0) {
      toast.error("Please rate your experience before submitting.");

      setLoading(false);
      return;
    }

    try {
      let userData = null;
      try {
        const profileResponse = await axios.get("/auth/profile");
        if (profileResponse.data.success && profileResponse.data.user) {
          userData = profileResponse.data.user;
        }
      } catch (profileError) {
        console.warn(
          "Failed to fetch user profile, sending anonymous feedback:",
          profileError,
        );
      }

      // Prepare feedback data
      const feedbackData = {
        subject: selectedTopic,
        message: feedback,
        type: selectedTopic.toLowerCase().replace(/\s+/g, "-"),
        rating: rating || null,
        // Add user data if available
        name: userData
          ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
          : "Anonymous",
        email: userData?.email || "Anonymous",
      };

      const response = await axios.post("/email/feedback", feedbackData);

      if (response.data.success) {
        toast.success("Feedback sent successfully!");

        // Reset form and close after delay
        setTimeout(() => {
          setSelectedTopic("");
          setFeedback("");
          setRating(0);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to send feedback. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-xl shadow-2xl shadow-gray-800  flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Send Feedback
          </h2>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select a topic...
            </label>
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 cursor-pointer py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-slate-700"
                required
                disabled={loading}
              >
                <option value="">Select a topic...</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your feedback...
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your feedback..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-700"
              required
              disabled={loading}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rate your experience
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  disabled={loading}
                  className={`w-10 h-10 cursor-pointer rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 ${
                    star === rating
                      ? star === 1
                        ? "bg-red-100 border-2 border-red-300 shadow-md"
                        : star === 2
                          ? "bg-orange-100 border-2 border-orange-300 shadow-md"
                          : star === 3
                            ? "bg-yellow-100 border-2 border-yellow-300 shadow-md"
                            : star === 4
                              ? "bg-blue-100 border-2 border-blue-300 shadow-md"
                              : "bg-green-100 border-2 border-green-300 shadow-md"
                      : "bg-slate-50 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  } disabled:opacity-50 disabled:transform-none`}
                >
                  <span
                    className={`text-lg transition-all duration-200 ${
                      star === rating ? "scale-110" : "scale-100"
                    }`}
                  >
                    {star === 1 && "😞"}
                    {star === 2 && "😕"}
                    {star === 3 && "😐"}
                    {star === 4 && "🙂"}
                    {star === 5 && "😊"}
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                {rating === 1 && "Very Poor"}
                {rating === 2 && "Poor"}
                {rating === 3 && "Average"}
                {rating === 4 && "Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-slate-900 text-white py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>
      <Toaster position="top-center" reverseOrder={true} />
    </div>
  );
};

export default FeedbackModal;
