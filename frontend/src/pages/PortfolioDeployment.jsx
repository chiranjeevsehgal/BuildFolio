// PortfolioDeployment.jsx - Fixed version
import React, { useState, useEffect } from 'react';
import { 
  Globe, Copy, ExternalLink, Settings, Eye, Download, 
  Share2, CheckCircle, AlertCircle, Loader2, Edit3,
  Monitor, Tablet, Smartphone, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const PortfolioDeployment = () => {
  const [deploymentStatus, setDeploymentStatus] = useState('checking');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [username, setUsername] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isDeploying, setIsDeploying] = useState(false);
  const [viewMode, setViewMode] = useState('desktop');

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const PORTFOLIO_BASE_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  useEffect(() => {
    // Set up axios defaults
    axios.defaults.baseURL = API_BASE_URL;
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    checkDeploymentStatus();
  }, []);

  // Check if portfolio is already deployed
  const checkDeploymentStatus = async () => {
    try {
      setDeploymentStatus('checking');
      
      const response = await axios.get('/auth/profile');
      
      if (response.data.success && response.data.user) {
        const user = response.data.user;
        
        setUserData(user);
        setUsername(user.username);
        setSelectedTemplate(user.selectedTemplate);
        
        // Check if portfolio is deployed
        if (user.portfolioDeployed || user.isPortfolioDeployed) {
          setDeploymentStatus('deployed');
          // Construct portfolio URL
          const constructedUrl = `${PORTFOLIO_BASE_URL}/portfolio/${user.username}`;
          setPortfolioUrl(constructedUrl);
        } else if (user.selectedTemplate) {
          setDeploymentStatus('ready');
          
          // Check if they previously had a deployed portfolio but template changed
          if (user.deployedAt && !user.portfolioDeployed) {
            setMessage({
              type: 'warning',
              content: 'Template was changed. Portfolio needs to be redeployed with the new design.'
            });
          }
        } else {
          setDeploymentStatus('error');
          console.log('No template selected');
          setMessage({
            type: 'error',
            content: 'No template selected. Please go back and select a template.'
          });
        }
      } else {
        console.log('Invalid response structure');
        throw new Error('Failed to load user data');
      }
    } catch (error) {
      console.error('Failed to check deployment status:', error);
      console.error('Error response:', error.response?.data);
      setDeploymentStatus('error');
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to load deployment information.'
      });
    }
  };

  // Deploy portfolio
  const deployPortfolio = async () => {
    try {
      setIsDeploying(true);
      setDeploymentStatus('deploying');
      setMessage({ type: 'info', content: 'Deploying your portfolio...' });
      
      const response = await axios.post('/portfolio/deploy', {
        templateId: selectedTemplate,
        username: username
      });
      
      if (response.data.success) {
        setDeploymentStatus('deployed');
        
        // Use the URL from response or construct it
        const deployedUrl = response.data.portfolioUrl || `${PORTFOLIO_BASE_URL}/portfolio/${username}`;
        setPortfolioUrl(deployedUrl);
        
        setMessage({
          type: 'success',
          content: 'Portfolio deployed successfully!'
        });
        
        // Update user data to reflect deployment status
        setUserData(prev => ({
          ...prev,
          portfolioDeployed: true,
          portfolioUrl: deployedUrl
        }));
        
      } else {
        throw new Error(response.data.message || 'Deployment failed');
      }
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      console.error('Error response:', error.response?.data);
      setDeploymentStatus('error');
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to deploy portfolio. Please try again.'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Redeploy portfolio (update with latest data)
  const redeployPortfolio = async () => {
    try {
      setIsDeploying(true);
      setMessage({ type: 'info', content: 'Updating your portfolio...' });
      
      const response = await axios.post('/portfolio/redeploy', {
        username: username
      });
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          content: 'Portfolio updated successfully!'
        });
        
        // Refresh the portfolio URL if provided
        if (response.data.portfolioUrl) {
          setPortfolioUrl(response.data.portfolioUrl);
        }
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Redeploy failed:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to update portfolio.'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Copy portfolio URL to clipboard
  const copyPortfolioUrl = async () => {
    if (!portfolioUrl) {
      setMessage({
        type: 'error',
        content: 'No portfolio URL available to copy.'
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setMessage({
        type: 'success',
        content: 'Portfolio URL copied to clipboard!'
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = portfolioUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setMessage({
        type: 'success',
        content: 'Portfolio URL copied to clipboard!'
      });
    }
  };

  // Share portfolio
  const sharePortfolio = async () => {
    if (!portfolioUrl) {
      setMessage({
        type: 'error',
        content: 'No portfolio URL available to share.'
      });
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userData?.firstName} ${userData?.lastName} - Portfolio`,
          text: 'Check out my professional portfolio!',
          url: portfolioUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyPortfolioUrl();
    }
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (message.content) {
      const timer = setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.content]);

  const getStatusIcon = () => {
    switch (deploymentStatus) {
      case 'checking':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />;
      case 'deploying':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />;
      case 'deployed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Globe className="w-8 h-8 text-blue-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (deploymentStatus) {
      case 'checking':
        return 'Checking deployment status...';
      case 'deploying':
        return 'Deploying your portfolio...';
      case 'deployed':
        return 'Your portfolio is live!';
      case 'error':
        return 'Deployment error occurred';
      default:
        return 'Ready to deploy';
    }
  };

  return (
    <>
      <Navbar current={"/portfolio"}/>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Portfolio Deployment
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Deploy your professional portfolio and share it with the world
          </p>
        </div>


        {/* Message Display */}
        {message.content && (
          <div className={`fixed top-4 right-4 z-50 rounded-lg p-4 flex items-center space-x-3 shadow-lg max-w-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : message.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : message.type === 'warning'
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message.content}</span>
            <button
              onClick={() => setMessage({ type: '', content: '' })}
              className="ml-2 text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}

        {/* Deployment Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="text-center mb-8">
            {getStatusIcon()}
            <h2 className="text-2xl font-semibold text-slate-800 mt-4 mb-2">
              {getStatusMessage()}
            </h2>
            {username && (
              <p className="text-slate-600">
                Username: <span className="font-medium text-slate-800">@{username}</span>
              </p>
            )}
            {selectedTemplate && (
              <p className="text-slate-600 mt-1">
                Template: <span className="font-medium text-slate-800">{selectedTemplate}</span>
              </p>
            )}
          </div>

          {/* Portfolio URL Display */}
          {deploymentStatus === 'deployed' && portfolioUrl && (
            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Your Portfolio URL</h3>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-3 font-mono text-sm text-slate-700 break-all">
                  {portfolioUrl}
                </div>
                <button
                  onClick={copyPortfolioUrl}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                  title="Copy URL"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {deploymentStatus === 'ready' && (
              <button
                onClick={deployPortfolio}
                disabled={isDeploying}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5 mr-2" />
                    Deploy Portfolio
                  </>
                )}
              </button>
            )}

            {deploymentStatus === 'deployed' && (
              <>
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View Portfolio
                </a>

                <button
                  onClick={sharePortfolio}
                  className="border-2 border-slate-300 text-slate-700 px-8 py-3 rounded-xl hover:bg-slate-50 transition-all font-semibold flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </button>

                <button
                  onClick={redeployPortfolio}
                  disabled={isDeploying}
                  className="border-2 border-blue-300 text-blue-700 px-8 py-3 rounded-xl hover:bg-blue-50 transition-all font-semibold flex items-center justify-center disabled:opacity-50"
                >
                  {isDeploying ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5 mr-2" />
                  )}
                  Update
                </button>
              </>
            )}

            {deploymentStatus === 'error' && (
              <button
                onClick={checkDeploymentStatus}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Portfolio Preview (if deployed) */}
        {deploymentStatus === 'deployed' && portfolioUrl && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-slate-800">Portfolio Preview</h3>
              
              {/* View Mode Controls */}
              <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                {[
                  { mode: 'desktop', icon: Monitor, label: 'Desktop' },
                  { mode: 'tablet', icon: Tablet, label: 'Tablet' },
                  { mode: 'mobile', icon: Smartphone, label: 'Mobile' }
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      viewMode === mode
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Iframe Preview */}
            <div className="relative">
              <div className={`mx-auto transition-all duration-300 ${
                viewMode === 'tablet' ? 'max-w-2xl' : 
                viewMode === 'mobile' ? 'max-w-sm' : 'w-full'
              }`}>
                <div className="bg-slate-200 rounded-lg overflow-hidden shadow-inner">
                  <iframe
                    src={portfolioUrl}
                    className="w-full h-96 border-0"
                    title="Portfolio Preview"
                    onError={() => console.error('Failed to load portfolio preview')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <button
            onClick={() => window.location.href = '/profile'}
            className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all group"
          >
            <Edit3 className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-slate-800 mb-2">Edit Profile</h3>
            <p className="text-sm text-slate-600">Update your information and redeploy</p>
          </button>

          <button
            onClick={() => window.location.href = '/templates'}
            className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all group"
          >
            <Settings className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-slate-800 mb-2">Change Template</h3>
            <p className="text-sm text-slate-600">Switch to a different design</p>
          </button>

          <button
            onClick={() => portfolioUrl && window.open(portfolioUrl, '_blank')}
            disabled={!portfolioUrl}
            className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-8 h-8 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-slate-800 mb-2">View Live</h3>
            <p className="text-sm text-slate-600">See your portfolio in action</p>
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default PortfolioDeployment;