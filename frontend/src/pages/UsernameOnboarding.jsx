import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, User, Globe, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const UsernameOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('idle'); // 'idle', 'checking', 'available', 'taken', 'invalid'
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [profileData, setProfileData] = useState({
    title: '',
    bio: '',
    location: '',
    website: ''
  });

  // To check username availability
  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameStatus('invalid');
      return;
    }

    setIsCheckingUsername(true);
    setUsernameStatus('checking');

    // Check for the username
    const isAvailable = !['admin', 'test', 'user', 'portfolio'].includes(usernameToCheck.toLowerCase());
      setUsernameStatus(isAvailable ? 'available' : 'taken');
      setIsCheckingUsername(false);
  };

  // Username checking (Using Debouncing for better performance)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      } else {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setUsername(value);
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit the onboarding
  const handleContinue = () => {
    if (currentStep === 1 && usernameStatus === 'available') {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      
      console.log('Onboarding complete:', { username, profileData });
    }
  };

  const getStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'available':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'taken':
      case 'invalid':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (usernameStatus) {
      case 'checking':
        return 'Checking availability...';
      case 'available':
        return 'Username is available!';
      case 'taken':
        return 'Username is already taken';
      case 'invalid':
        return 'Username must be at least 3 characters';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (usernameStatus) {
      case 'available':
        return 'text-green-600';
      case 'taken':
      case 'invalid':
        return 'text-red-600';
      case 'checking':
        return 'text-blue-600';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step {currentStep} of 2</span>
            <span className="text-sm text-slate-500">{currentStep === 1 ? 'Choose Username' : 'Complete Profile'}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">PortfolioGenerator</span>
          </div>
        </div>

        {/* Step 1: Username Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Choose Your Username</h2>
              <p className="text-slate-600">This will be your unique portfolio URL</p>
            </div>

            <div className="space-y-6">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                    portfoliogenerator.com/
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    className="w-full pl-41 pr-12 py-4 text-md border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                    placeholder="your-name"
                    maxLength="30"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon()}
                  </div>
                </div>
                {username && (
                  <p className={`mt-2 text-sm ${getStatusColor()}`}>
                    {getStatusMessage()}
                  </p>
                )}
              </div>

              {/* URL Preview */}
              {username && usernameStatus === 'available' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Your Portfolio URL</span>
                  </div>
                  <p className="text-green-700 font-mono text-sm break-all">
                    https://portfoliogenerator.com/{username}
                  </p>
                </div>
              )}

              {/* Username Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Username Guidelines</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 3-30 characters long</li>
                      <li>• Only letters, numbers, and hyphens</li>
                      <li>• Cannot start or end with a hyphen</li>
                      <li>• Must be unique</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={usernameStatus !== 'available' || isCheckingUsername}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Continue to Profile Setup
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Profile Setup */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Complete Your Profile</h2>
              <p className="text-slate-600">Add some basic information to get started</p>
            </div>

            <div className="space-y-6">
              {/* Confirmed Username */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Your Username</p>
                    <p className="text-green-700 font-mono">portfoliogenerator.com/{username}</p>
                  </div>
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>

              {/* Profile Fields */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Professional Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={profileData.title}
                  onChange={(e) => handleProfileChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="e.g., Software Engineer, Product Manager, Designer"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">
                  Brief Bio <span className="text-slate-400">(Optional)</span>
                </label>
                <textarea
                  id="bio"
                  rows="3"
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white resize-none"
                  placeholder="Tell visitors about yourself in a few sentences..."
                  maxLength="200"
                ></textarea>
                <p className="mt-1 text-xs text-slate-500 text-right">{profileData.bio.length}/200 characters</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 border-2 border-slate-300 text-slate-700 py-3 px-4 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Complete Setup
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Need help? <a href="mailto:chiranjeevsehgal@gmail.com" className="text-blue-600 hover:text-blue-700 underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsernameOnboarding;