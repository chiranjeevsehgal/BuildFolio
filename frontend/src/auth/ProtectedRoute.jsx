import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isProfileCompleted: false,
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setAuthStatus({ isAuthenticated: false, isProfileCompleted: false });
          setIsLoading(false);
          return;
        }

        // Set up axios for this request
        axios.defaults.baseURL = API_BASE_URL;
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        axios.defaults.headers.common["Content-Type"] = "application/json";

        // Check user profile status
        const response = await axios.get("/auth/profile");

        if (response.data.success) {
          setAuthStatus({
            isAuthenticated: true,
            isProfileCompleted: response.data.user.isProfileCompleted,
          });
        } else {
          // Invalid token or user not found
          localStorage.removeItem("authToken");
          delete axios.defaults.headers.common["Authorization"];
          setAuthStatus({ isAuthenticated: false, isProfileCompleted: false });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Remove invalid token
        localStorage.removeItem("authToken");
        delete axios.defaults.headers.common["Authorization"];
        setAuthStatus({ isAuthenticated: false, isProfileCompleted: false });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [API_BASE_URL]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to signin
  if (!authStatus.isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Authenticated and profile completed - render children
  return children;
};

export default ProtectedRoute;
