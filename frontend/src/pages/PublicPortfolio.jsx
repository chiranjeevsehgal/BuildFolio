
// PublicPortfolio.jsx - Component to render public portfolio at /:username
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getTemplateComponent } from '../templates/TemplateRegistry';
import axios from 'axios';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (username) {
      loadPortfolioData();
    }
  }, [username]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch public portfolio data
      const response = await axios.get(`${API_BASE_URL}/portfolio/public/${username}`);
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Get the template component
        const templateInfo = getTemplateComponent(data.selectedTemplate);
        
        if (!templateInfo) {
          throw new Error(`Template not found: ${data.selectedTemplate}`);
        }
        
        setPortfolioData({
          ...data,
          templateComponent: templateInfo.component
        });
      } else {
        throw new Error(response.data.message || 'Portfolio not found');
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setError(error.response?.status === 404 ? 'Portfolio not found' : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio...</p>
          <p className="text-sm text-gray-500 mt-2">@{username}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Portfolio Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            The portfolio for <strong>@{username}</strong> could not be found or is not public.
          </p>
        </div>
      </div>
    );
  }

  // Render portfolio
  if (portfolioData && portfolioData.templateComponent) {
    const TemplateComponent = portfolioData.templateComponent;
    
    return (
      <div>
        {/* SEO Meta Tags */}
        <head>
          <title>{portfolioData.firstName} {portfolioData.lastName} - Portfolio</title>
          <meta name="description" content={portfolioData.professional?.summary || `Professional portfolio of ${portfolioData.firstName} ${portfolioData.lastName}`} />
          <meta property="og:title" content={`${portfolioData.firstName} ${portfolioData.lastName} - Portfolio`} />
          <meta property="og:description" content={portfolioData.professional?.summary} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.href} />
        </head>
        
        <TemplateComponent userData={portfolioData} />
      </div>
    );
  }

  return null;
};

export default PublicPortfolio;