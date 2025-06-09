import { useEffect, useState } from 'react';
import axios from 'axios';

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

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access Denied</div>;

  return children;
};

export default ProtectedAdminRoute;