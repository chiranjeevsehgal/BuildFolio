import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Camera, Linkedin, Edit3, Save, ArrowRight, Briefcase, GraduationCap, Award, ExternalLink, Calendar, MapPin, Mail, Phone, Globe, Github, AlertCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';

const ProfileDataCollection = () => {
    const [importMethod, setImportMethod] = useState('manual');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    const [profileData, setProfileData] = useState({
        personalInfo: {
            phone: '',
            location: '',
            socialLinks: {
                linkedin: '',
                github: '',
                twitter: ''
            }
        },
        professional: {
            title: '',
            summary: '',
            skills: []
        },
        experience: [],
        education: [],
        projects: [],
        certifications: []
    });

    const [newSkill, setNewSkill] = useState('');
    const [editingSection, setEditingSection] = useState(null);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const [newProjectSkill, setNewProjectSkill] = useState('');

    // Validation rules
    const validationRules = {
        phone: { required: true, pattern: /^\+?[1-9]\d{9}$/ },
        location: { required: true, minLength: 2 },
        title: { required: true, minLength: 2 },
        summary: { required: true, minLength: 50 },
        skills: { required: true, minCount: 3 }
    };

    // Setting up axios defaults
    useEffect(() => {
        axios.defaults.baseURL = API_BASE_URL;
        axios.defaults.headers.common['Content-Type'] = 'application/json';

        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        loadProfile();
    }, [API_BASE_URL]);

    // Email validation for social links
    const isValidUrl = (url) => {
        if (!url) return true; // Optional fields
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Validate individual field
    const validateField = (field, value, rules) => {
        const errors = [];

        if (rules.required && (!value || (Array.isArray(value) && value.length === 0))) {
            errors.push('This field is required');
        }

        if (value && rules.minLength && value.length < rules.minLength) {
            errors.push(`Minimum ${rules.minLength} characters required`);
        }

        if (value && rules.maxLength && value.length > rules.maxLength) {
            errors.push(`Maximum ${rules.maxLength} characters allowed`);
        }

        if (value && rules.pattern && !rules.pattern.test(value)) {
            errors.push('Enter a valid 10-digit phone number');
        }

        if (Array.isArray(value) && rules.minCount && value.length < rules.minCount) {
            errors.push(`At least ${rules.minCount} items required`);
        }

        return errors;
    };

    // Validate entire form
    const validateForm = () => {
        const errors = {};

        // Validate required fields
        const phoneErrors = validateField('phone', profileData.personalInfo.phone, validationRules.phone);
        if (phoneErrors.length > 0) errors.phone = phoneErrors;

        const locationErrors = validateField('location', profileData.personalInfo.location, validationRules.location);
        if (locationErrors.length > 0) errors.location = locationErrors;

        const titleErrors = validateField('title', profileData.professional.title, validationRules.title);
        if (titleErrors.length > 0) errors.title = titleErrors;

        const summaryErrors = validateField('summary', profileData.professional.summary, validationRules.summary);
        if (summaryErrors.length > 0) errors.summary = summaryErrors;

        const skillsErrors = validateField('skills', profileData.professional.skills, validationRules.skills);
        if (skillsErrors.length > 0) errors.skills = skillsErrors;


        // Validate URLs
        if (profileData.personalInfo.socialLinks.linkedin && !isValidUrl(profileData.personalInfo.socialLinks.linkedin)) {
            errors.linkedin = ['Invalid URL format'];
        }

        if (profileData.personalInfo.socialLinks.github && !isValidUrl(profileData.personalInfo.socialLinks.github)) {
            errors.github = ['Invalid URL format'];
        }

        setValidationErrors(errors);
        const isValid = Object.keys(errors).length === 0;
        setIsFormValid(isValid);
        return isValid;
    };

    // Calculate completion percentage
    const calculateCompletionPercentage = () => {
        let completed = 0;
        let total = 0;

        // Personal info (30 points)
        total += 30;
        if (profileData.personalInfo.phone) completed += 10;
        if (profileData.personalInfo.location) completed += 10;
        if (profileData.personalInfo.socialLinks.linkedin) completed += 10;

        // Professional (40 points)
        total += 40;
        if (profileData.professional.title) completed += 10;
        if (profileData.professional.summary && profileData.professional.summary.length >= 50) completed += 15;
        if (profileData.professional.skills.length >= 3) completed += 15;

        // Experience (30 points)
        total += 30;
        if (profileData.experience.length >= 1) {
            completed += 15;
            // Check if first experience is complete
            const firstExp = profileData.experience[0];
            if (firstExp && firstExp.title && firstExp.company && firstExp.startDate && firstExp.description) {
                completed += 15;
            }
        }

        const percentage = Math.round((completed / total) * 100);
        setCompletionPercentage(percentage);
        return percentage;
    };

    // Effect to validate form and calculate completion on data change
    useEffect(() => {
        validateForm();
        calculateCompletionPercentage();
    }, [profileData]);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/profiles/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.profile) {
                    const profile = data.profile;

                    setProfileData({
                        personalInfo: {
                            phone: profile.phone || '',
                            location: profile.location || '',
                            website: profile.website || '',
                            socialLinks: profile.socialLinks || { linkedin: '', github: '', twitter: '' }
                        },
                        professional: {
                            title: profile.title || '',
                            summary: profile.summary || '',
                            skills: profile.skills || []
                        },
                        experience: (profile.experience || []).map(exp => ({
                            ...exp,
                            startDate: formatDateForInput(exp.startDate),
                            endDate: formatDateForInput(exp.endDate)
                        })),
                        education: (profile.education || []).map(edu => ({
                            ...edu,
                            startDate: formatDateForInput(edu.startDate),
                            endDate: formatDateForInput(edu.endDate)
                        })),
                        projects: profile.projects || [],
                        certifications: profile.certifications || []
                    });
                    setProfilePhoto(profile.profilePhoto);
                    setCompletionPercentage(profile.completionPercentage || 0);
                }
            } else {
                throw new Error('Failed to load profile');
            }
        } catch (error) {
            console.error('Load profile error:', error);
            setMessage({
                type: 'error',
                content: 'Failed to load profile data'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateForInput = (dateString) => {
        // Return empty string if no date provided
        if (!dateString) return '';

        try {
            // Create Date object from ISO string
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date format:', dateString);
                return '';
            }

            // Get year (4 digits)
            const year = date.getFullYear();

            // Get month (1-12) and pad with zero if needed (01-12)
            const month = String(date.getMonth() + 1).padStart(2, '0');

            // Return in yyyy-MM format
            return `${year}-${month}`;

        } catch (error) {
            console.warn('Error formatting date:', dateString, error);
            return '';
        }
    };



    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (file.size > 5 * 1024 * 1024) {
            setMessage({
                type: 'error',
                content: 'Image size must be less than 5MB'
            });
            return;
        }

        if (!file.type.startsWith('image/')) {
            setMessage({
                type: 'error',
                content: 'Please upload an image file'
            });
            return;
        }

        setUploadingPhoto(true);

        // Simulate API call
        setTimeout(() => {
            const photoUrl = URL.createObjectURL(file);
            setProfilePhoto(photoUrl);
            setMessage({
                type: 'success',
                content: 'Profile photo uploaded successfully!'
            });
            setUploadingPhoto(false);
        }, 1500);
    };

    const updateProfileData = (section, field, value) => {
        setProfileData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const updateSocialLinks = (platform, value) => {
        setProfileData(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                socialLinks: {
                    ...prev.personalInfo.socialLinks,
                    [platform]: value
                }
            }
        }));
    };

    const addSkill = () => {
        if (newSkill.trim() && !profileData.professional.skills.includes(newSkill.trim())) {
            setProfileData(prev => ({
                ...prev,
                professional: {
                    ...prev.professional,
                    skills: [...prev.professional.skills, newSkill.trim()]
                }
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (index) => {
        setProfileData(prev => ({
            ...prev,
            professional: {
                ...prev.professional,
                skills: prev.professional.skills.filter((_, i) => i !== index)
            }
        }));
    };

    const removeProject = (index) => {
        setProfileData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    const updateProject = (index, field, value) => {
        setProfileData(prev => ({
            ...prev,
            projects: prev.projects.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const removeProjectSkill = (projectIndex, skillIndex) => {
        const updatedProjects = [...profileData.projects];
        updatedProjects[projectIndex].skills = updatedProjects[projectIndex].skills.filter((_, i) => i !== skillIndex);
        setProfileData(prev => ({
            ...prev,
            projects: updatedProjects
        }));
    };

    const addProjectSkill = (projectIndex) => {
        const skillToAdd = profileData.projects[projectIndex].skill;

        if (skillToAdd && skillToAdd.trim()) {
            const updatedProjects = [...profileData.projects];
            updatedProjects[projectIndex].skills = [...(updatedProjects[projectIndex].skills || []), skillToAdd.trim()];
            updatedProjects[projectIndex].skill = '';
            setProfileData(prev => ({
                ...prev,
                projects: updatedProjects
            }));
        }
    };

    const addExperience = () => {
        const newExp = {
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        };
        setProfileData(prev => ({
            ...prev,
            experience: [...prev.experience, newExp]
        }));
        setEditingSection('experience');
    };

    const updateExperience = (index, field, value) => {
        setProfileData(prev => ({
            ...prev,
            experience: prev.experience.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const removeExperience = (index) => {
        setProfileData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }));
    };

    const saveProfile = async () => {
        if (!validateForm()) {
            setMessage({
                type: 'error',
                content: 'Please fix the validation errors before saving'
            });
            return;
        }

        setIsSaving(true);

        try {
            const payload = {
                phone: profileData.personalInfo.phone,
                location: profileData.personalInfo.location,
                socialLinks: profileData.personalInfo.socialLinks,
                title: profileData.professional.title,
                summary: profileData.professional.summary,
                skills: profileData.professional.skills,
                experience: profileData.experience,
                education: profileData.education,
                projects: profileData.projects,
                certifications: profileData.certifications
            };

            const response = await axios.put('/profiles/me', payload);

            if (response.data.success) {
                setCompletionPercentage(response.data.profile.completionPercentage);
                setMessage({
                    type: 'success',
                    content: 'Profile saved successfully!'
                });
            }
        } catch (error) {
            console.error('Save profile error:', error);
            setMessage({
                type: 'error',
                content: error.response?.data?.errors[0]?.msg ? error.response?.data?.errors[0]?.msg : error.response?.data?.message || 'Failed to save profile'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleContinue = async () => {
        if (completionPercentage < 60) {
            setMessage({
                type: 'warning',
                content: 'Please complete at least 60% of your profile before continuing'
            });
            return;
        }

        await saveProfile();
        if (isFormValid) {
            setTimeout(() => {
                setMessage({
                    type: 'success',
                    content: 'Redirecting to templates...'
                });
            }, 1500);
        }
    };

    const clearMessage = () => {
        setMessage({ type: '', content: '' });
    };

    const getFieldError = (fieldName) => {
        return validationErrors[fieldName] ? validationErrors[fieldName][0] : '';
    };

    const hasFieldError = (fieldName) => {
        return !!validationErrors[fieldName];
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                        Build Your Professional Profile
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4">
                        Add your information to create your portfolio
                    </p>

                    {/* Completion Progress */}
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-sm text-slate-600 mb-2">
                            <span>Profile Completion</span>
                            <span>{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Message Display */}
                {message.content && (
                    <div className={`rounded-lg p-4 flex items-center space-x-3 mb-6 ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : message.type === 'warning'
                            ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">{message.content}</span>
                        <button
                            onClick={clearMessage}
                            className="ml-auto text-current hover:opacity-70"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Profile Form */}
                <div className="space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-slate-800">Personal Information</h2>
                            <button
                                onClick={saveProfile}
                                disabled={isSaving || !isFormValid}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>

                        {/* Profile Photo */}
                        <div className="flex items-center space-x-6 mb-8">
                            <div className="relative">
                                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                                    {profilePhoto ? (
                                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-slate-400" />
                                    )}
                                    {uploadingPhoto && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={uploadingPhoto}
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-800 mb-1">Profile Photo</h3>
                                <p className="text-sm text-slate-600 mb-2">Upload a professional headshot (max 5MB)</p>
                                <button
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    disabled={uploadingPhoto}
                                >
                                    {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                                </button>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="tel"
                                        value={profileData.personalInfo.phone}
                                        onChange={(e) => updateProfileData('personalInfo', 'phone', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasFieldError('phone') ? 'border-red-500' : 'border-slate-300'}`}
                                        placeholder="9988776655"
                                    />
                                </div>
                                {hasFieldError('phone') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={profileData.personalInfo.location}
                                        onChange={(e) => updateProfileData('personalInfo', 'location', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasFieldError('location') ? 'border-red-500' : 'border-slate-300'}`}
                                        placeholder="Bangalore, India"
                                    />
                                </div>
                                {hasFieldError('location') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('location')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn</label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={profileData.personalInfo.socialLinks.linkedin}
                                        onChange={(e) => updateSocialLinks('linkedin', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasFieldError('linkedin') ? 'border-red-500' : 'border-slate-300'}`}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                                {hasFieldError('linkedin') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('linkedin')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">GitHub</label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={profileData.personalInfo.socialLinks.github}
                                        onChange={(e) => updateSocialLinks('github', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasFieldError('github') ? 'border-red-500' : 'border-slate-300'}`}
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                                {hasFieldError('github') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('github')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Professional Summary */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Professional Summary</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Professional Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={profileData.professional.title}
                                    onChange={(e) => updateProfileData('professional', 'title', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasFieldError('title') ? 'border-red-500' : 'border-slate-300'}`}
                                    placeholder="e.g. Senior Software Engineer"
                                />
                                {hasFieldError('title') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Professional Summary <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows="4"
                                    value={profileData.professional.summary}
                                    onChange={(e) => updateProfileData('professional', 'summary', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${hasFieldError('summary') ? 'border-red-500' : 'border-slate-300'}`}
                                    placeholder="Write a brief summary of your professional background and expertise... (minimum 50 characters)"
                                    maxLength="1000"
                                ></textarea>
                                <div className="flex justify-between mt-1">
                                    <div>
                                        {hasFieldError('summary') && (
                                            <p className="text-sm text-red-600">{getFieldError('summary')}</p>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {profileData.professional.summary.length}/1000 characters
                                    </p>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Skills <span className="text-red-500">*</span> (minimum 3)
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {profileData.professional.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => removeSkill(index)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Add a skill"
                                    />
                                    <button
                                        onClick={addSkill}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                {hasFieldError('skills') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('skills')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Experience Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-slate-800">
                                Work Experience
                            </h2>
                            <button
                                onClick={addExperience}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Experience</span>
                            </button>
                        </div>

                        {profileData.experience.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>No work experience added yet</p>
                                <p className="text-sm">Click "Add Experience" to get started</p>
                                {hasFieldError('experience') && (
                                    <p className="mt-2 text-sm text-red-600">{getFieldError('experience')}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {profileData.experience.map((exp, index) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium text-slate-800">
                                                {exp.title || 'New Position'} {exp.company && `at ${exp.company}`}
                                            </h3>
                                            <button
                                                onClick={() => removeExperience(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={exp.title}
                                                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${hasFieldError(`experience_${index}_title`) ? 'border-red-500' : 'border-slate-300'}`}
                                                    placeholder="Job Title *"
                                                />
                                                {hasFieldError(`experience_${index}_title`) && (
                                                    <p className="mt-1 text-sm text-red-600">{getFieldError(`experience_${index}_title`)}</p>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${hasFieldError(`experience_${index}_company`) ? 'border-red-500' : 'border-slate-300'}`}
                                                    placeholder="Company Name *"
                                                />
                                                {hasFieldError(`experience_${index}_company`) && (
                                                    <p className="mt-1 text-sm text-red-600">{getFieldError(`experience_${index}_company`)}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={exp.location}
                                                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                                    placeholder="Location"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="month"
                                                    value={exp.startDate}
                                                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${hasFieldError(`experience_${index}_startDate`) ? 'border-red-500' : 'border-slate-300'}`}
                                                    placeholder="Start Date"
                                                />
                                                {hasFieldError(`experience_${index}_startDate`) && (
                                                    <p className="mt-1 text-sm text-red-600">{getFieldError(`experience_${index}_startDate`)}</p>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="month"
                                                    value={exp.current ? '' : exp.endDate}
                                                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                                    disabled={exp.current}
                                                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full disabled:bg-slate-100 ${hasFieldError(`experience_${index}_endDate`) ? 'border-red-500' : 'border-slate-300'}`}
                                                    placeholder="End Date"
                                                />
                                                {hasFieldError(`experience_${index}_endDate`) && (
                                                    <p className="mt-1 text-sm text-red-600">{getFieldError(`experience_${index}_endDate`)}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-4">
                                            <input
                                                type="checkbox"
                                                checked={exp.current}
                                                onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                                            />
                                            <span className="text-sm text-slate-600">Current position</span>
                                        </div>

                                        <div>
                                            <textarea
                                                rows="3"
                                                value={exp.description}
                                                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${hasFieldError(`experience_${index}_description`) ? 'border-red-500' : 'border-slate-300'}`}
                                                placeholder="Describe your responsibilities, achievements, and key contributions... (minimum 20 characters) *"
                                            ></textarea>
                                            {hasFieldError(`experience_${index}_description`) && (
                                                <p className="mt-1 text-sm text-red-600">{getFieldError(`experience_${index}_description`)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Education Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-slate-800">Education</h2>
                            <button
                                onClick={() => {
                                    const newEdu = {
                                        degree: '',
                                        school: '',
                                        location: '',
                                        startDate: '',
                                        endDate: '',
                                        description: ''
                                    };
                                    setProfileData(prev => ({
                                        ...prev,
                                        education: [...prev.education, newEdu]
                                    }));
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Education</span>
                            </button>
                        </div>

                        {profileData.education.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>No education added yet</p>
                                <p className="text-sm">Click "Add Education" to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {profileData.education.map((edu, index) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium text-slate-800">
                                                {edu.degree || 'New Education'} {edu.school && `at ${edu.school}`}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setProfileData(prev => ({
                                                        ...prev,
                                                        education: prev.education.filter((_, i) => i !== index)
                                                    }));
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => {
                                                    setProfileData(prev => ({
                                                        ...prev,
                                                        education: prev.education.map((item, i) =>
                                                            i === index ? { ...item, degree: e.target.value } : item
                                                        )
                                                    }));
                                                }}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Degree/Certification"
                                            />
                                            <input
                                                type="text"
                                                value={edu.school}
                                                onChange={(e) => {
                                                    setProfileData(prev => ({
                                                        ...prev,
                                                        education: prev.education.map((item, i) =>
                                                            i === index ? { ...item, school: e.target.value } : item
                                                        )
                                                    }));
                                                }}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Institution Name"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <input
                                                type="text"
                                                value={edu.location}
                                                onChange={(e) => {
                                                    setProfileData(prev => ({
                                                        ...prev,
                                                        education: prev.education.map((item, i) =>
                                                            i === index ? { ...item, location: e.target.value } : item
                                                        )
                                                    }));
                                                }}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Location"
                                            />
                                            <input
                                                type="month"
                                                value={edu.startDate}
                                                onChange={(e) => {
                                                    setProfileData(prev => ({
                                                        ...prev,
                                                        education: prev.education.map((item, i) =>
                                                            i === index ? { ...item, startDate: e.target.value } : item
                                                        )
                                                    }));
                                                }}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Start Date"
                                            />
                                            <input
                                                type="month"
                                                value={edu.endDate}
                                                onChange={(e) => {
                                                    setProfileData(prev => ({
                                                        ...prev,
                                                        education: prev.education.map((item, i) =>
                                                            i === index ? { ...item, endDate: e.target.value } : item
                                                        )
                                                    }));
                                                }}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="End Date"
                                            />
                                        </div>

                                        <textarea
                                            rows="2"
                                            value={edu.description}
                                            onChange={(e) => {
                                                setProfileData(prev => ({
                                                    ...prev,
                                                    education: prev.education.map((item, i) =>
                                                        i === index ? { ...item, description: e.target.value } : item
                                                    )
                                                }));
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Additional details, achievements, or relevant coursework..."
                                        ></textarea>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Projects Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-slate-800">Projects</h2>
                            <button
                                onClick={() => {
                                    const newProject = {
                                        title: '',
                                        description: '',
                                        skills: [],
                                        url: '',
                                        githubUrl: '',
                                        featured: false
                                    };
                                    setProfileData(prev => ({
                                        ...prev,
                                        projects: [...prev.projects, newProject]
                                    }));
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Project</span>
                            </button>
                        </div>

                        {profileData.projects.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>No projects added yet</p>
                                <p className="text-sm">Click "Add Project" to showcase your work</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {profileData.projects.map((project, index) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium text-slate-800">
                                                {project.title || 'New Project'}
                                            </h3>
                                            <button
                                                onClick={() => removeProject(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-1 gap-4 mb-4">
                                            <input
                                                type="text"
                                                value={project.title}
                                                onChange={(e) => updateProject(index, 'title', e.target.value)}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Project Title"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <input
                                                type="url"
                                                value={project.url}
                                                onChange={(e) => updateProject(index, 'url', e.target.value)}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Project URL"
                                            />
                                            <input
                                                type="url"
                                                value={project.githubUrl}
                                                onChange={(e) => updateProject(index, 'githubUrl', e.target.value)}
                                                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="GitHub URL"
                                            />
                                        </div>

                                        <div className='gap-4 mb-4'>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {(project.skills || []).map((skill, skillIndex) => (
                                                    <span
                                                        key={skillIndex}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {skill}
                                                        <button
                                                            onClick={() => removeProjectSkill(index, skillIndex)}
                                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={project.skill}
                                                    onChange={(e) => updateProject(index, 'skill', e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && addProjectSkill(index)}
                                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Add a skill"
                                                />
                                                <button
                                                    onClick={() => addProjectSkill(index)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <textarea
                                            rows="3"
                                            value={project.description}
                                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
                                            placeholder="Project description and key features..."
                                        ></textarea>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={project.featured}
                                                onChange={(e) => updateProject(index, 'featured', e.target.checked)}
                                                className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                                            />
                                            <span className="text-sm text-slate-600">Featured project</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Save and Continue Button */}
                    <div className="flex justify-between items-center pt-8">
                        <div className="text-sm text-slate-600">
                            <p>Profile completion: <span className="font-semibold">{completionPercentage}%</span></p>
                            <p className="text-xs">Complete at least 60% to proceed to templates</p>
                            {!isFormValid && Object.keys(validationErrors).length > 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                    Please fix {Object.keys(validationErrors).length} validation error(s)
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={saveProfile}
                                disabled={isSaving || !isFormValid}
                                className="flex items-center space-x-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
                            </button>

                            <button
                                onClick={handleContinue}
                                disabled={completionPercentage < 60 || isSaving || !isFormValid}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                Continue to Templates
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDataCollection;