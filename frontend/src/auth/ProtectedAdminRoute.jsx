import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Lock, Shield } from 'lucide-react';

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Setting up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get('/auth/profile');
        if (response.data.success && response.data.user.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Admin check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

   if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-gray-600">
                You don't have permission to access this section
              </p>
            </div>
            
            <p className="text-sm text-gray-500 mb-8">
              This section requires administrator privileges. Please contact your system administrator if you believe this is an error.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 cursor-pointer hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                Go Back
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                Return to Home
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center text-xs text-gray-400">
                <Shield className="h-4 w-4 mr-1" />
                <span>Protected Section</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute;