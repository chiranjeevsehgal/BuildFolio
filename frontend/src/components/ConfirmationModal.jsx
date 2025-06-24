import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

// Custom Confirmation Modal Component
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info
  isLoading = false 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
          confirmButton: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white",
          iconBg: "bg-red-100"
        };
      case 'info':
        return {
          icon: <Check className="w-6 h-6 text-blue-500" />,
          confirmButton: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white",
          iconBg: "bg-blue-100"
        };
      default: // warning
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          confirmButton: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white",
          iconBg: "bg-amber-100"
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-white/20 bg-opacity-30 backdrop-blur-md transition-all" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${typeStyles.iconBg}`}>
                  {typeStyles.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-slate-600 mb-6 leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            <div className="flex space-x-3 justify-end">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 cursor-pointer text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${typeStyles.confirmButton}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing confirmation modal state
export const useConfirmationModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    isLoading: false,
    onConfirm: () => {},
  });

  const showConfirmation = ({
    title = "Confirm Action",
    message = "Are you sure you want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning",
    onConfirm = () => {}
  }) => {
    return new Promise((resolve, reject) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        isLoading: false,
        onConfirm: async () => {
          try {
            setModalState(prev => ({ ...prev, isLoading: true }));
            await onConfirm();
            resolve(true);
            setModalState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          } catch (error) {
            setModalState(prev => ({ ...prev, isLoading: false }));
            reject(error);
          }
        }
      });
    });
  };

  const hideConfirmation = () => {
    setModalState(prev => ({ ...prev, isOpen: false, isLoading: false }));
  };

  return {
    modalState,
    showConfirmation,
    hideConfirmation,
    ConfirmationModal: (props) => (
      <ConfirmationModal
        {...modalState}
        onClose={hideConfirmation}
        {...props}
      />
    )
  };
};

export default ConfirmationModal;