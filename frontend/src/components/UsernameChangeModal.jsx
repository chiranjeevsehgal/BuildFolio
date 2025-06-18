import { AlertCircle, CheckCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import axios from 'axios';

const UsernameChangeModal = ({ showUsernameModal, oldUsername, newUsername, setNewUsername, setLoading, loading, setShowUsernameModal, setAccountData, showMessageParent }) => {
    if (!showUsernameModal) return null;


    const [message, setMessage] = useState({ type: '', content: '' });

    const showMessage = useCallback((type, content) => {
        setMessage({ type, content });
    }, []);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Set up axios defaults
    useEffect(() => {
        axios.defaults.baseURL = API_BASE_URL;
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Auto-dismiss messages
    useEffect(() => {
        if (message.content) {
            const timer = setTimeout(() => {
                setMessage({ type: '', content: '' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [message.content]);

    const confirmUsernameChange = async () => {
        if (!newUsername || !newUsername.trim()) {
            showMessage('warning', 'Please enter a new username.');
            return;
        }
        if (oldUsername.trim() === newUsername.trim()) {
            showMessage('warning', 'New username must be different from your current username');
            return;
        }

        setLoading(prev => ({ ...prev, action: 'username' }));

        try {
            const response = await axios.put('/profiles/change-username', {
                newUsername: newUsername.trim()
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(response.data);
            
            if (response.data.success) {
                
                setAccountData(prev => ({
                    ...prev,
                    username: response.data.user.username
                }));

                showMessageParent('success', 'Username changed successfully.');
                setNewUsername(''); // Clear the input
                setShowUsernameModal(false);
            } else {
                throw new Error(response.data.message || 'Failed to change username');
            }

        } catch (error) {
            console.error('Username change failed:', error);

            let errorMessage = 'Failed to change username. Please try again.';

            if (error.response?.status === 400) {
                if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    errorMessage = error.response.data.errors.map(err => err.message || err.msg).join(', ');
                    showMessage('error', `${error.response.data.errors.map(err => err.message || err.msg).join(', ')}`);
                    return;
                } else {
                    errorMessage = error.response.data.message || 'Invalid username provided.';
                    showMessage('error', `${error.response.data.message || 'Invalid username provided.'}`);
                    return;
                }
            } else if (error.response?.status === 409) {
                errorMessage = 'Username already taken. Please choose a different username.';
                showMessage('error', 'Username already taken. Please choose a different username.');
                return;
            } else if (error.response?.status === 401) {
                errorMessage = 'Session expired. Please log in again.';
                showMessage('error', 'Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/signin';
                }, 2000);
            }

            showMessage('error', errorMessage);
        } finally {
            setLoading(prev => ({ ...prev, action: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Message Toast */}
            {message.content && (
                <div className={`fixed top-20 right-4 z-50 rounded-2xl p-4 flex items-center space-x-3 shadow-2xl backdrop-blur-sm max-w-sm transform transition-all duration-300 ${message.type === 'success'
                    ? 'bg-green-500/90 text-white'
                    : message.type === 'error'
                        ? 'bg-red-500/90 text-white'
                        : 'bg-blue-500/90 text-white'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{message.content}</span>
                    <button
                        onClick={() => setMessage({ type: '', content: '' })}
                        className="ml-2 text-white/80 hover:text-white transition-colors"
                    >
                        ×
                    </button>
                </div>
            )}
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Change Username</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        <strong>Important:</strong> Changing your username will:
                    </p>
                    <ul className="text-left text-slate-600 text-sm mt-2 space-y-1">
                        <li>• Unpublish your current portfolio</li>
                        <li>• Require you to redeploy your portfolio</li>
                        <li>• Change your portfolio URL</li>
                        <li>• This action cannot be undone</li>
                    </ul>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Username
                    </label>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter new username"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setShowUsernameModal(false);
                            setNewUsername('');
                        }}
                        className="flex-1 py-3 px-4 border cursor-pointer border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmUsernameChange}
                        disabled={loading.action === 'username'}
                        className="flex-1 py-3 px-4 cursor-pointer bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {loading.action === 'username' ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Changing...
                            </div>
                        ) : (
                            'Change Username'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsernameChangeModal;