import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const DeactivateAccountModal = ({ loading, setLoading, setShowDeactivateModal, showMessage: showMessageParent }) => {
    const [localMessage, setLocalMessage] = useState({ type: '', content: '' });

    const showLocalMessage = useCallback((type, content) => {
        setLocalMessage({ type, content });
    }, []);

    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const VITE_ENV = import.meta.env.VITE_ENV;
    // Set up axios defaults
    useEffect(() => {
        axios.defaults.baseURL = API_BASE_URL;
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    const confirmDeactivateAccount = async () => {
        setLoading(prev => ({ ...prev, action: 'deactivate' }));

        try {
            // API call to deactivate account
            const response = await axios.patch('/profiles/deactivate-account', {
                // Update user table
                isActive: false,
                portfolioDeployed: false,
                // Update portfolio deployment table
                portfolioDeployment: {
                    isActive: false,
                    isPublic: false,
                    status: 'deactivated'
                }
            });

            if (response.data.success) {
                setShowDeactivateModal(false);
                showMessageParent('success', 'Account deactivated successfully.');

                if (VITE_ENV === 'development') {
                    setTimeout(() => {
                        localStorage.removeItem('authToken');
                        window.location.href = '/signin';
                    }, 1500);
                } else {
                    localStorage.removeItem('authToken');
                    window.location.href = '/signin';
                }
            }
        } catch (error) {
            console.error('Account deactivation failed:', error);
            showLocalMessage('error', 'Failed to deactivate account. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, action: '' }));
        }
    };

    // Function to cancel deactivation
    const cancelDeactivation = () => {
        setShowDeactivateModal(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {/* Local Message Toast */}
            {localMessage.content && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-60 rounded-2xl p-4 flex items-center space-x-3 shadow-2xl backdrop-blur-sm max-w-sm transition-all duration-300 ${localMessage.type === 'success'
                        ? 'bg-green-500/90 text-white'
                        : localMessage.type === 'error'
                            ? 'bg-red-500/90 text-white'
                            : localMessage.type === 'warning'
                                ? 'bg-amber-500/90 text-white'
                                : 'bg-blue-500/90 text-white'
                    }`}>
                    {localMessage.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{localMessage.content}</span>
                    <button
                        onClick={() => setLocalMessage({ type: '', content: '' })}
                        className="ml-2 cursor-pointer text-white/80 hover:text-white transition-colors"
                    >
                        ×
                    </button>
                </div>
            )}
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Deactivate Account</h3>
                </div>

                <p className="text-gray-600 mb-4">
                    Are you sure you want to deactivate your account? This action cannot be undone and will:
                </p>

                <ul className="text-sm text-gray-600 mb-6 space-y-2 bg-gray-50 p-4 rounded-md">
                    <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                        Make your account inactive
                    </li>
                    <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                        Unpublish your portfolio
                    </li>
                </ul>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={cancelDeactivation}
                        className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                        disabled={loading.action === 'deactivate'}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDeactivateAccount}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center cursor-pointer"
                        disabled={loading.action === 'deactivate'}
                    >
                        {loading.action === 'deactivate' ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deactivating...
                            </>
                        ) : (
                            'Yes, Deactivate Account'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
};

export default DeactivateAccountModal;