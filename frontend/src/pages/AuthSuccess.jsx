import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // 'processing', 'error', 'redirecting'
  const [message, setMessage] = useState('Completing login...');

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('No authentication token found');
          setTimeout(() => {
            navigate('/signin', { replace: true });
          }, 2000);
          return;
        }

        // Store the token in localStorage
        localStorage.setItem('authToken', token);
        
        // Set up axios defaults
        axios.defaults.baseURL = API_BASE_URL;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setMessage('Fetching your profile...');

        // Fetch user profile to determine redirect
        const response = await axios.get('/auth/profile');
        
        if (response.data.success && response.data.user) {
          const user = response.data.user;
          
          // Store user data
          localStorage.setItem('portfolioUser', JSON.stringify(user));
          
          setStatus('redirecting');
          setMessage('Welcome back! Redirecting...');

          // Determine redirect path based on user status
          const redirectPath = getRedirectPath(user);
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 1500);
          
        } else {
          throw new Error('Failed to fetch user profile');
        }
        
      } catch (error) {
        console.error('Auth success error:', error);
        setStatus('error');
        
        if (error.response?.status === 401) {
          setMessage('Authentication failed. Please try logging in again.');
          // Clear invalid token
          localStorage.removeItem('authToken');
          setTimeout(() => {
            navigate('/signin', { replace: true });
          }, 2000);
        } else {
          setMessage('Something went wrong. Redirecting to login...');
          setTimeout(() => {
            navigate('/signin', { replace: true });
          }, 2000);
        }
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate, API_BASE_URL]);

  // Determine redirect path based on user completion status
  const getRedirectPath = (user) => {
    console.log('User status:', {
      isProfileCompleted: user.isProfileCompleted,
      selectedTemplate: user.selectedTemplate,
      portfolioDeployed: user.portfolioDeployed
    });

    // Priority order for redirects
    if (!user.isProfileCompleted) {
      console.log('Redirecting to profile - not completed');
      return '/profile';
    }
    
    if (!user.selectedTemplate) {
      console.log('Redirecting to templates - no template selected');
      return '/templates';
    }
    
    if (user.selectedTemplate && !user.portfolioDeployed) {
      console.log('Redirecting to portfolio - template selected but not deployed');
      return '/portfolio';
    }
    
    if (user.portfolioDeployed) {
      console.log('Redirecting to portfolio - portfolio is deployed');
      return '/portfolio';
    }
    
    // Fallback
    console.log('Redirecting to templates - fallback');
    return '/templates';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          {/* Loading/Success/Error States */}
          {status === 'processing' && (
            <div className="text-blue-600 mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            </div>
          )}
          
          {status === 'redirecting' && (
            <div className="text-green-600 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-red-600 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}

          {/* Status Message */}
          <h2 className={`text-xl font-semibold mb-2 ${
            status === 'error' ? 'text-red-600' : 
            status === 'redirecting' ? 'text-green-600' : 
            'text-slate-800'
          }`}>
            {status === 'error' ? 'Authentication Error' :
             status === 'redirecting' ? 'Success!' :
             'Authenticating...'}
          </h2>
          
          <p className={`${
            status === 'error' ? 'text-red-600' : 'text-slate-600'
          }`}>
            {message}
          </p>

          {/* Progress indicator for success */}
          {status === 'redirecting' && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-1.5 w-full">
                <div className="bg-green-600 h-1.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
          )}

          {/* Manual redirect option for errors */}
          {status === 'error' && (
            <div className="mt-6">
              <button
                onClick={() => navigate('/signin', { replace: true })}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;