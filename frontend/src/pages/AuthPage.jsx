import React, { useEffect, useState } from 'react';
import { Eye, ArrowLeft, EyeOff, Mail, Lock, User, Sparkles, Chrome, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import OTPVerification from '../components/OTPVerification';

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('signin'); // signin, signup, email-verification, otp-verification, complete-registration
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Email verification states
  const [tempToken, setTempToken] = useState('');
  const [verifiedToken, setVerifiedToken] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const VITE_ENV = import.meta.env.VITE_ENV;

  // Setting up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [API_BASE_URL]);

  // Check for OAuth success/error from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('authToken', token);
      setMessage({ type: 'success', content: 'Successfully signed in!' });
      // Redirecting to dashboard
      if (VITE_ENV === 'development') {
        setTimeout(() => {
          window.location.href = '/templates';
        }, 2000);
      } else {
        window.location.href = '/templates';
      }
    } else if (error) {
      setMessage({ type: 'error', content: 'OAuth authentication failed. Please try again.' });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (authMode === 'email-verification') {
      // Only validate email for email verification step
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    } else if (authMode === 'complete-registration') {
      // Validate registration fields
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      } else if (formData.firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
      }

      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      } else if (formData.lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
      }

      if (!formData.username.trim()) {
        errors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Original validation for signin mode
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await axios.post('/auth/send-otp', {
        email: formData.email
      });

      if (response.data.success) {
        setTempToken(response.data.tempToken);
        setAuthMode('otp-verification');
        setMessage({
          type: 'success',
          content: 'Verification code sent to your email!'
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.param || err.path] = err.msg;
        });
        setFormErrors(backendErrors);
      } else {
        setMessage({
          type: 'error',
          content: error.response?.data?.message || 'Failed to send verification code. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification success
  const handleOTPVerified = (verifiedToken, email) => {
    setVerifiedToken(verifiedToken);
    setVerifiedEmail(email);
    setAuthMode('complete-registration');
    setMessage({
      type: 'success',
      content: 'Email verified successfully! Complete your registration.'
    });
  };

  // Handle resend OTP
  const handleResendOTP = async (currentTempToken) => {
    try {
      const response = await axios.post('/auth/resend-otp', {
        tempToken: currentTempToken
      });

      if (response.data.success) {
        setTempToken(response.data.tempToken);
        setMessage({
          type: 'success',
          content: 'New verification code sent!'
        });
        return response.data.tempToken;
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to resend code. Please try again.'
      });
      throw error;
    }
  };

  // Complete registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await axios.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
        verifiedToken
      });

      if (response.data.success) {

        setMessage({
          type: 'success',
          content: 'Account created successfully. Please sign in using your credentials.'
        });

        if (VITE_ENV === 'development') {
          setTimeout(() => {
            window.location.href = '/signin'
          }, 1500);
        } else {
          window.location.href = '/signin'
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.param || err.path] = err.msg;
        });
        setFormErrors(backendErrors);
      } else {
        setMessage({
          type: 'error',
          content: error.response?.data?.message || 'Registration failed. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signin (unchanged)
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await axios.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        const user = response.data.user;

        const redirectUser = () => {
          if (!user.isProfileCompleted) {
            window.location.href = '/profile';
          } else if (!user.selectedTemplate) {
            window.location.href = '/templates';
          } else if (user.selectedTemplate && !user.portfolioDeployed) {
            window.location.href = '/portfolio';
          } else if (user.portfolioDeployed) {
            window.location.href = '/portfolio';
          } else {
            window.location.href = '/templates';
          }
        };

        setMessage({
          type: 'success',
          content: 'Welcome back!'
        });

        if (VITE_ENV === 'development') {
          setTimeout(() => {
            redirectUser();
          }, 1500);
        } else {
          redirectUser();
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.param || err.path] = err.msg;
        });
        setFormErrors(backendErrors);
      } else {
        setMessage({
          type: 'error',
          content: error.response?.data?.message || 'Sign in failed. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth integration (unchanged)
  const handleOAuthLogin = (provider) => {
    if (provider === 'linkedin') {
      setMessage({
        type: 'success',
        content: "Linkedin Auth will be rolled out soon!"
      })
      return
    }
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const clearMessage = () => {
    setMessage({ type: '', content: '' });
  };

  const handleBack = () => {
    if (authMode === 'otp-verification') {
      setAuthMode('email-verification');
      setTempToken('');
    } else if (authMode === 'complete-registration') {
      setAuthMode('otp-verification');
      setVerifiedToken('');
    } else if (authMode === 'email-verification') {
      setAuthMode('signup');
    }
    setMessage({ type: '', content: '' });
    setFormErrors({});
  };

  // Determine what to render based on auth mode
  const renderContent = () => {
    if (authMode === 'otp-verification') {
      return (
        <OTPVerification
          email={formData.email}
          tempToken={tempToken}
          onVerified={handleOTPVerified}
          onBack={handleBack}
          onResend={handleResendOTP}
          axios={axios}
        />
      );
    }

    return (
      <>
        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center cursor-pointer justify-center px-4 py-3 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-5 h-5 mr-3 text-blue-500" />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500">Or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={
          authMode === 'signin' ? handleSignIn :
            authMode === 'email-verification' ? handleSendOTP :
              authMode === 'complete-registration' ? handleCompleteRegistration :
                handleSendOTP
        } className="space-y-4">

          {/* Email Field - Always visible except in complete-registration */}
          {authMode !== 'complete-registration' && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  placeholder="john@example.com"
                  disabled={isLoading || authMode === 'otp-verification'}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
          )}

          {/* Registration Fields - Only show in complete-registration mode */}
          {authMode === 'complete-registration' && (
            <>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Email verified: <span className="font-semibold">{verifiedEmail}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                    First Name
                  </label>
                   <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white ${formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      placeholder="John"
                      disabled={isLoading}
                    />
                  </div>
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white ${formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      placeholder="Doe"
                      disabled={isLoading}
                    />
                  </div>
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white ${formErrors.username ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    placeholder="john_doe"
                    disabled={isLoading}
                  />
                </div>
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>
            </>
          )}

          {/* Password Field - Show in signin and complete-registration */}
          {(authMode === 'signin' || authMode === 'complete-registration') && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white ${formErrors.password ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
          )}

          {/* Confirm Password - Only in complete-registration */}
          {authMode === 'complete-registration' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white ${formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Remember Me - Only in signin */}
          {authMode === 'signin' && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={isLoading}
                />
                <span className="ml-2 text-slate-600">Remember me</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {authMode === 'signin' ? 'Signing In...' :
                  authMode === 'email-verification' ? 'Sending Code...' :
                    authMode === 'complete-registration' ? 'Creating Account...' : 'Processing...'}
              </>
            ) : (
              authMode === 'signin' ? 'Sign In' :
                authMode === 'email-verification' ? 'Send Verification Code' :
                  authMode === 'complete-registration' ? 'Create Account' : 'Continue'
            )}
          </button>

          {/* Back Button for registration flow */}
          {(authMode === 'email-verification' || authMode === 'complete-registration') && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="w-full flex cursor-pointer items-center justify-center px-4 py-2 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}
        </form>

        {/* Toggle Auth Mode - Only show in signin/signup */}
        {(authMode === 'signin' || authMode === 'signup') && (
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                onClick={() => {
                  if (authMode === 'signin') {
                    setAuthMode('email-verification');
                  } else {
                    setAuthMode('signin');
                  }
                  setFormErrors({});
                  setMessage({ type: '', content: '' });
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    username: '',
                    firstName: '',
                    lastName: ''
                  });
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {authMode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <a href='/' className='cursor-pointer'>
            <img src="logo.svg" className='align-middle justify-center' alt="BuildFolio Logo" />
          </a>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {authMode === 'signin' ? 'Welcome back!' :
              authMode === 'email-verification' ? 'Create your account' :
                authMode === 'otp-verification' ? 'Check your email' :
                  authMode === 'complete-registration' ? 'Complete your registration' : 'Welcome!'}
          </h2>
          <p className="text-slate-600">
            {authMode === 'signin' ? 'Sign in to access your dashboard' :
              authMode === 'email-verification' ? 'Start by verifying your email address' :
                authMode === 'otp-verification' ? 'Enter the verification code we sent you' :
                  authMode === 'complete-registration' ? 'Fill in your details to complete registration' :
                    'Start building your professional portfolio today'}
          </p>
        </div>

        {/* Message Display */}
        {message.content && (
          <div className={`rounded-lg p-4 flex items-center space-x-3 ${message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
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

        {/* Auth Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;