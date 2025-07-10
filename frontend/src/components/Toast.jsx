// Toast.jsx - Create this as a separate component
import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const Toast = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message.content) {
      setIsVisible(true);
      setIsExiting(false);
    }
  }, [message]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!message.content || !isVisible) return null;

  const getToastStyles = () => {
    switch (message.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 shadow-green-100";
      case "error":
        return "bg-red-50 border-red-200 text-red-800 shadow-red-100";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800 shadow-amber-100";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800 shadow-gray-100";
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full pointer-events-auto">
      <div
        className={`
                    ${getToastStyles()}
                    rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out transform
                    ${
                      isExiting
                        ? "translate-x-full opacity-0 scale-95"
                        : "translate-x-0 opacity-100 scale-100"
                    }
                `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">{message.content}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-current hover:opacity-70 transition-opacity p-1 rounded-md hover:bg-black/5"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Toast Container for multiple toasts (optional)
const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast, index) => (
        <div key={toast.id || index} className="pointer-events-auto">
          <Toast message={toast} onClose={() => onClose(toast.id || index)} />
        </div>
      ))}
    </div>
  );
};

export default Toast;
