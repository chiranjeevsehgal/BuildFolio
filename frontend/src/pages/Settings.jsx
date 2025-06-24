import React, { useState, useEffect, useCallback } from 'react';
import {
    User,
    Mail,
    Lock,
    Trash2,
    Download,
    Link,
    Edit3,
    Save,
    X,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    MapPin,
    Briefcase,
    DollarSign,
    FileText,
    Clock,
    Target,
    User2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import UsernameChangeModal from '../components/UsernameChangeModal';
import PasswordChangeModal from '../components/PasswordChangeModal';
import DeactivateAccountModal from '../components/DeactivateAccountModal';
import toast, { Toaster } from 'react-hot-toast';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState({ personal: false, resume: false });
    const [loading, setLoading] = useState({ page: true, save: false, action: '' });
    const [newUsername, setNewUsername] = useState('');
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Form states
    const [accountData, setAccountData] = useState({
        email: '',
        username: '',
        password: '',
        provider: ''
    });

    const [personalData, setPersonalData] = useState({
        firstName: '',
        lastName: '',
        careerStage: '',
    });

    const [resumeData, setResumeData] = useState({
        industry: '',
        jobSearchTimeline: '',
        resumeExperience: ''
    });

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'account', name: 'Account', icon: Lock },
        // { id: 'billing', name: 'Billing', icon: DollarSign }
    ];

    const careerStageOptions = [
        'Entry Level (0-2 Years)',
        'Mid Level (2-6 Years)',
        'Senior Level (6-12 Years)',
        'Executive Level (12+ Years)'
    ];

    const jobSearchTimelineOptions = [
        'Immediately',
        'Within 1 month',
        'Within 3 months',
        'Within 6 months',
        'Not actively looking'
    ];

    const industryOptions = [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Marketing',
        'Sales',
        'Engineering',
        'Design',
        'Other'
    ];

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // Set up axios defaults
    useEffect(() => {
        axios.defaults.baseURL = API_BASE_URL;
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        loadUserData();
    }, []);

    const showMessage = useCallback((type, content) => {
        if (type === 'success') {
            toast.success(content)
        }
        else if (type === 'sad') {
            toast(content, {
                icon: '😟',
            });
        }
    }, []);

    const loadUserData = async () => {
        setLoading(prev => ({ ...prev, page: true }));

        try {
            try {
                const response = await axios.get('/profiles/settings');

                if (response.data.success && response.data.user) {
                    const user = response.data.user;

                    setPersonalData({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        careerStage: user.careerStage || '',
                    });

                    setAccountData({
                        email: user.email || '',
                        username: user.username || '',
                        provider: user.oauthProvider || '',
                    });

                    setResumeData({
                        industry: user.industry || '',
                        jobSearchTimeline: user.jobSearchTimeline || '',
                        resumeExperience: user.resumeExperience || ''
                    });
                } else {
                    throw new Error('Failed to load user data');
                }
            } catch (error) {
                console.error('Error response:', error.response?.data);
            } finally {
                setLoading(prev => ({ ...prev, page: false }));
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            toast.error('Failed to load user data. Please refresh the page.')
            setLoading(prev => ({ ...prev, page: false }));
        }
    };

    const handleChangeUsername = async () => {
        setShowUsernameModal(true);
    };

    const handleChangePassword = async () => {
        setShowPasswordModal(true);
    };

    const handleDeactivateAccount = async () => {
        setShowDeactivateModal(true);
    };

    const handleSavePersonalData = async () => {
        setLoading(prev => ({ ...prev, save: true }));
        if (!personalData.firstName || !personalData.firstName.trim()) {
            toast('First name cannot be empty.', {
                icon: 'ℹ️',
            });
            setLoading(prev => ({ ...prev, save: false }));
            return;
        }
        try {
            const payload = {};
            if (personalData.firstName && personalData.firstName.trim()) {
                payload.firstName = personalData.firstName.trim();
            }

            payload.lastName = personalData.lastName ? personalData.lastName.trim() : '';

            payload.careerStage = personalData.careerStage || '';

            // Check if payload has any data to send
            if (Object.keys(payload).length === 0) {
                toast('Please fill in at least one field before saving.', {
                    icon: 'ℹ️',
                });
                setLoading(prev => ({ ...prev, save: false }));
                return;
            }

            const response = await axios.put('/profiles/settings/personal', payload);

            if (response.data.success) {
                setPersonalData(prev => ({
                    ...prev,
                    firstName: response.data.user.firstName || '',
                    lastName: response.data.user.lastName || '',
                    careerStage: response.data.user.careerStage || ''
                }));

                toast.success('Personal information updated successfully.')
                setIsEditing(prev => ({ ...prev, personal: false }));
            } else {
                throw new Error(response.data.message || 'Failed to save personal data');
            }

        } catch (error) {
            console.error('Failed to save personal data:', error);

            // Handling different types of errors
            let errorMessage = 'Failed to save personal information. Please try again.';

            if (error.response?.status === 400) {
                // Validation errors
                if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    errorMessage = error.response.data.errors.map(err => err.message || err.msg).join(', ');
                } else {
                    errorMessage = error.response.data.message || 'Invalid data provided.';
                }
            } else if (error.response?.status === 401) {
                errorMessage = 'Session expired. Please log in again.';
                // Optionally redirect to login
                setTimeout(() => {
                    window.location.href = '/signin';
                }, 2000);
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to perform this action.';
            } else if (error.response?.status === 404) {
                errorMessage = 'User not found. Please refresh the page.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
                errorMessage = 'Network error. Please check your connection.';
            }

            toast.error(errorMessage)
        } finally {
            setLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleSaveResumeData = async () => {
        setLoading(prev => ({ ...prev, save: true }));

        try {
            const payload = {};

            payload.industry = resumeData.industry || '';
            payload.jobSearchTimeline = resumeData.jobSearchTimeline || '';
            payload.resumeExperience = resumeData.resumeExperience ? resumeData.resumeExperience.trim() : '';

            const response = await axios.put('/profiles/settings/resume', payload);

            if (response.data.success) {
                setResumeData(prev => ({
                    ...prev,
                    industry: response.data.user.industry || '',
                    jobSearchTimeline: response.data.user.jobSearchTimeline || '',
                    resumeExperience: response.data.user.resumeExperience || ''
                }));

                toast.success('Resume information updated successfully.')
                setIsEditing(prev => ({ ...prev, resume: false }));
            } else {
                throw new Error(response.data.message || 'Failed to save resume data');
            }

        } catch (error) {
            console.error('Failed to save resume data:', error);

            // Handling different types of errors
            let errorMessage = 'Failed to save resume information. Please try again.';

            if (error.response?.status === 400) {
                // Validation errors
                if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    errorMessage = error.response.data.errors.map(err => err.message || err.msg).join(', ');
                } else {
                    errorMessage = error.response.data.message || 'Invalid data provided.';
                }
            } else if (error.response?.status === 401) {
                errorMessage = 'Session expired. Please log in again.';
                // Optionally redirect to login
                setTimeout(() => {
                    window.location.href = '/signin';
                }, 2000);
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to perform this action.';
            } else if (error.response?.status === 404) {
                errorMessage = 'User not found. Please refresh the page.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
                errorMessage = 'Network error. Please check your connection.';
            }

            toast.error(errorMessage)
        } finally {
            setLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleInputChange = (section, field, value) => {
        if (section === 'personal') {
            setPersonalData(prev => ({ ...prev, [field]: value }));
        } else if (section === 'resume') {
            setResumeData(prev => ({ ...prev, [field]: value }));
        }
    };

    const toggleEdit = (section) => {
        setIsEditing(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const cancelEdit = (section) => {
        setIsEditing(prev => ({ ...prev, [section]: false }));
    };

    if (loading.page) {
        return (
            <>
                <Navbar current="/settings" />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading settings...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar current="/settings" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
                <div className="max-w-6xl mx-auto">

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
                        {/* Tab Navigation */}
                        <div className="border-b border-slate-200/50">
                            <nav className="flex space-x-4 sm:space-x-6 lg:space-x-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 overflow-x-auto">
                                {tabs.map((tab) => {
                                    const IconComponent = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`pb-3 sm:pb-4 px-1 border-b-2 cursor-pointer font-medium text-xs sm:text-sm transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${activeTab === tab.id
                                                ? 'border-blue-600 text-blue-700'
                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                                }`}
                                        >
                                            <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 sm:p-6 lg:p-8">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6 sm:space-y-8">
                                    {/* Personal Section */}
                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/50">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
                                                <User className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                                                Personal
                                            </h2>
                                            {!isEditing.personal ? (
                                                <button
                                                    onClick={() => toggleEdit('personal')}
                                                    className="bg-blue-600 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 font-medium text-sm w-fit"
                                                >
                                                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span>Edit</span>
                                                </button>
                                            ) : (
                                                <div className="flex flex-row space-x-2">
                                                    <button
                                                        onClick={handleSavePersonalData}
                                                        disabled={loading.save}
                                                        className="bg-green-600 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 font-medium disabled:opacity-50 text-sm"
                                                    >
                                                        {loading.save ? (
                                                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        )}
                                                        <span>Save</span>
                                                    </button>
                                                    <button
                                                        onClick={() => cancelEdit('personal')}
                                                        className="bg-slate-500 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-slate-600 transition-colors duration-200 flex items-center space-x-2 font-medium text-sm"
                                                    >
                                                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span>Cancel</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                                                {isEditing.personal ? (
                                                    <input
                                                        type="text"
                                                        value={personalData.firstName}
                                                        onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                                        placeholder="Enter first name"
                                                    />
                                                ) : (
                                                    <p className="text-slate-800 py-2 sm:py-3 text-sm sm:text-base">{personalData.firstName || '-'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                                                {isEditing.personal ? (
                                                    <input
                                                        type="text"
                                                        value={personalData.lastName}
                                                        onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                                        placeholder="Enter last name"
                                                    />
                                                ) : (
                                                    <p className="text-slate-800 py-2 sm:py-3 text-sm sm:text-base">{personalData.lastName || '-'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Career Stage</label>
                                                {isEditing.personal ? (
                                                    <select
                                                        value={personalData.careerStage}
                                                        onChange={(e) => handleInputChange('personal', 'careerStage', e.target.value)}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                                    >
                                                        <option value="">Select career stage</option>
                                                        {careerStageOptions.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <p className="text-slate-800 py-2 sm:py-3 text-sm sm:text-base">{personalData.careerStage || '-'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resume Section */}
                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/50">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                                            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
                                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                                                Resume
                                            </h2>
                                            {!isEditing.resume ? (
                                                <button
                                                    onClick={() => toggleEdit('resume')}
                                                    className="bg-blue-600 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 font-medium text-sm w-fit"
                                                >
                                                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span>Edit</span>
                                                </button>
                                            ) : (
                                                <div className="flex flex-row space-x-2">
                                                    <button
                                                        onClick={handleSaveResumeData}
                                                        disabled={loading.save}
                                                        className="bg-green-600 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 font-medium disabled:opacity-50 text-sm"
                                                    >
                                                        {loading.save ? (
                                                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        )}
                                                        <span>Save</span>
                                                    </button>
                                                    <button
                                                        onClick={() => cancelEdit('resume')}
                                                        className="bg-slate-500 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-slate-600 transition-colors duration-200 flex items-center space-x-2 font-medium text-sm"
                                                    >
                                                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span>Cancel</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">What industry are you pursuing?</label>
                                                {isEditing.resume ? (
                                                    <select
                                                        value={resumeData.industry}
                                                        onChange={(e) => handleInputChange('resume', 'industry', e.target.value)}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 cursor-pointer border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                                    >
                                                        <option value="">Select industry</option>
                                                        {industryOptions.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <p className="text-slate-800 py-2 sm:py-3 text-sm sm:text-base">{resumeData.industry || '-'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">How quickly are you looking to get a new job?</label>
                                                {isEditing.resume ? (
                                                    <select
                                                        value={resumeData.jobSearchTimeline}
                                                        onChange={(e) => handleInputChange('resume', 'jobSearchTimeline', e.target.value)}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border cursor-pointer border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                                    >
                                                        <option value="">Select timeline</option>
                                                        {jobSearchTimelineOptions.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <p className="text-slate-800 py-2 sm:py-3 text-sm sm:text-base">{resumeData.jobSearchTimeline || '-'}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Resume Experience</label>
                                                {isEditing.resume ? (
                                                    <input
                                                        type="text"
                                                        value={resumeData.resumeExperience}
                                                        onChange={(e) => handleInputChange('resume', 'resumeExperience', e.target.value)}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                                                        placeholder="Enter resume experience"
                                                    />
                                                ) : (
                                                    <p className="text-slate-800 py-2 sm:py-3 text-sm sm:text-base">{resumeData.resumeExperience || '-'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Tab */}
                            {activeTab === 'account' && (
                                <div className="space-y-4 sm:space-y-6">
                                    {/* Email Section */}
                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/50">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 flex items-center">
                                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                                                    Email
                                                </h3>
                                                <p className="text-blue-600 font-medium text-sm sm:text-base break-all">{accountData.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Username Section */}
                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/50">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 flex items-center">
                                                    <User2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                                                    Username
                                                </h3>
                                                <p className="text-blue-600 font-medium text-sm sm:text-base break-all">{accountData.username}</p>
                                            </div>
                                            <button
                                                onClick={handleChangeUsername}
                                                disabled={loading.action === 'username'}
                                                className="bg-teal-600 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors duration-200 font-medium disabled:opacity-50 text-sm w-fit"
                                            >
                                                {loading.action === 'username' ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        <span className="hidden sm:inline">Processing...</span>
                                                    </div>
                                                ) : (
                                                    <span className="whitespace-nowrap">Change Username</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password Section */}
                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/50">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 flex items-center">
                                                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                                                    Password
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-blue-600 font-medium text-sm sm:text-base">********</p>
                                                </div>
                                            </div>

                                            {accountData.provider === '' || !accountData.provider ? (
                                                <button
                                                    onClick={handleChangePassword}
                                                    disabled={loading.action === 'password'}
                                                    className="bg-teal-600 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors duration-200 font-medium disabled:opacity-50 text-sm w-fit"
                                                >
                                                    {loading.action === 'password' ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            <span className="hidden sm:inline">Processing...</span>
                                                        </div>
                                                    ) : (
                                                        <span className="whitespace-nowrap">Change Password</span>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="bg-slate-400 cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-xl font-medium opacity-60 text-sm"
                                                    title={`Password change not available for ${accountData.provider} accounts`}
                                                >
                                                    <span className="whitespace-nowrap">Change Password</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Deactivate Account Section */}
                                    <div className="bg-red-50/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-200/50">
                                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
                                            <div className="min-w-0 flex-1 lg:pr-4">
                                                <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2 flex items-center">
                                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                                                    Deactivate your account
                                                </h3>
                                                <p className="text-red-700 text-xs sm:text-sm leading-relaxed">
                                                    When you choose to deactivate your account, you will no longer have access to BuildFolio's
                                                    services, and your personal data will be permanently removed.
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleDeactivateAccount}
                                                disabled={loading.action === 'deactivate'}
                                                className="bg-red-600 cursor-pointer text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50 text-sm w-fit"
                                            >
                                                {loading.action === 'deactivate' ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        <span className="hidden sm:inline">Processing...</span>
                                                    </div>
                                                ) : (
                                                    <span className="whitespace-nowrap">Deactivate Account</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* {activeTab === 'billing' && (
                <div className="text-center py-12 sm:py-20">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md mx-auto">
                    <DollarSign className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-600 mb-4">Billing Coming Soon</h3>
                    <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
                      Billing and subscription management features will be available soon.
                    </p>
                  </div>
                </div>
              )} */}
                        </div>
                    </div>
                </div>
            </div>
            {showUsernameModal && <UsernameChangeModal
                showUsernameModal={showUsernameModal}
                setShowUsernameModal={setShowUsernameModal}
                newUsername={newUsername}
                oldUsername={accountData.username}
                setNewUsername={setNewUsername}
                setAccountData={setAccountData}
                setLoading={setLoading}
                showMessageParent={showMessage}
                loading={loading}
            />}

            {showPasswordModal && <PasswordChangeModal
                showPasswordModal={showPasswordModal}
                setShowPasswordModal={setShowPasswordModal}
                setLoading={setLoading}
                loading={loading}
                showMessage={showMessage}
            />}

            {showDeactivateModal && <DeactivateAccountModal
                loading={loading}
                setLoading={setLoading}
                setShowDeactivateModal={setShowDeactivateModal}
                showMessage={showMessage}
            />}
            <Toaster
                position="top-center"
                reverseOrder={true}
            />
        </>
    );
};

export default Settings;