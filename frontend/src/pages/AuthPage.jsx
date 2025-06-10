import React, { useEffect, useState } from 'react';
import { Eye, ArrowLeft, EyeOff, Mail, Lock, User, Sparkles, Chrome, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('signin'); // Signin or Signup
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

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    } else if (authMode === 'signup' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Signup specific validations
    if (authMode === 'signup') {
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

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  // Backend integration for signin and signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const endpoint = authMode === 'signin' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'signin'
        ? { email: formData.email, password: formData.password }
        : {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          username: formData.username,
          password: formData.password
        };

      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        // Store token
        localStorage.setItem('authToken', response.data.token);

        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data.user));

        const user = response.data.user;

        console.log(user);

        const redirectUser = () => {
          // Check completion status and redirect accordingly
          if (!user.isProfileCompleted) {
            // Profile not completed - go to profile page
            window.location.href = '/profile';
          } else if (!user.selectedTemplate) {
            // Profile completed but no template selected - go to templates
            window.location.href = '/templates';
          } else if (user.selectedTemplate && !user.portfolioDeployed) {
            // Template selected but portfolio not deployed - go to portfolio
            window.location.href = '/portfolio';
          } else if (user.portfolioDeployed) {
            // Portfolio is deployed - go to portfolio dashboard
            window.location.href = '/portfolio';
          } else {
            // Fallback - go to templates
            window.location.href = '/templates';
          }
        };

        // Set success message
        setMessage({
          type: 'success',
          content: authMode === 'signin' ? 'Welcome back!' : 'Account created successfully!'
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
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.param || err.path] = err.msg;
        });
        setFormErrors(backendErrors);
      } else {
        setMessage({
          type: 'error',
          content: error.response?.data?.message || 'An error occurred. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Oauth integration
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          {/* <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </button> */}

          {/* <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">BuildFolio</span>
          </div> */}

          <a href='/' className='cursor-pointer'><img src="logo.svg" className='align-middle justify-center' /></a>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {authMode === 'signin' ? 'Welcome back!' : 'Create your account'}
          </h2>
          <p className="text-slate-600">
            {authMode === 'signin'
              ? 'Sign in to access your dashboard'
              : 'Start building your professional portfolio today'
            }
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

            {/* <button
              onClick={() => handleOAuthLogin('linkedin')}
              disabled={isLoading}
              className="w-full flex items-center cursor-pointer justify-center px-4 py-3 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 mr-3 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">in</span>
              </div>
              Continue with LinkedIn
            </button> */}

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
          <div className="space-y-4">
            {authMode === 'signup' && (
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
            )}

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
                  disabled={isLoading}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {authMode === 'signup' && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    id="username"
                    name="username"
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
            )}

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

            {authMode === 'signup' && (
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
                {/* <button 
                  type="button" 
                  className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  Forgot password?
                </button> */}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                authMode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>

          {/* Terms and Privacy for Signup */}
          {/* {authMode === 'signup' && (
            <p className="mt-4 text-xs text-slate-500 text-center">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>
            </p>
          )} */}

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setFormErrors({});
                  setMessage({ type: '', content: '' });
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {authMode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        {/* <div className="text-center">
          <div className="flex justify-center items-center space-x-6 opacity-60">
          <div className="text-xs text-slate-400">🔒 SSL Secured</div>
            <div className="text-xs text-slate-400">⚡ Instant Setup</div>
            <div className="text-xs text-slate-400">⚙️ Easy Customization</div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default AuthPage;