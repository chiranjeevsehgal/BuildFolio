import React, { useState, useEffect } from 'react';
import { 
  Globe, Copy, ExternalLink, Settings, Eye, Download, 
  Share2, CheckCircle, AlertCircle, Loader2, Edit3,
  Monitor, Tablet, Smartphone, RefreshCw, ArrowRight,
  Zap, Sparkles, Rocket, Clock, Users, BarChart3,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PortfolioDeployment = () => {
  const [deploymentStatus, setDeploymentStatus] = useState('checking');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [username, setUsername] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isDeploying, setIsDeploying] = useState(false);
  const [viewMode, setViewMode] = useState('desktop');
  const [deploymentProgress, setDeploymentProgress] = useState(0);

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

  useEffect(() => {
  // Only reset progress when not deploying
  if (deploymentStatus !== 'deploying') {
    setDeploymentProgress(deploymentStatus === 'deployed' ? 100 : 0);
  }
}, [deploymentStatus]);

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
          const constructedUrl = `${PORTFOLIO_BASE_URL}/portfolio/${user.username}`;
          setPortfolioUrl(constructedUrl);
          setDeploymentProgress(100);
        } else if (user.selectedTemplate) {
          setDeploymentStatus('ready');
          
          if (user.deployedAt && !user.portfolioDeployed) {
            // setMessage({
            //   type: 'warning',
            //   content: 'Deploy your portfolio to see it live.'
            // });
          }
        } else {
          setDeploymentStatus('error');
          setMessage({
            type: 'error',
            content: 'No template selected. Please go back and select a template.'
          });
        }
      } else {
        throw new Error('Failed to load user data');
      }
    } catch (error) {
      console.error('Failed to check deployment status:', error);
      setDeploymentStatus('error');
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to load deployment information.'
      });
    }
  };

  // Deploy portfolio with progress simulation
  const deployPortfolio = async () => {
    try {
      setIsDeploying(true);
      setDeploymentStatus('deploying');
      setDeploymentProgress(0);
      setMessage({ type: 'info', content: 'Deploying your portfolio...' });
      
      // Simulate deployment steps
      const steps = [
        { progress: 20, message: 'Preparing your portfolio...' },
        { progress: 40, message: 'Building template...' },
        { progress: 60, message: 'Optimizing assets...' },
        { progress: 80, message: 'Publishing to CDN...' },
        { progress: 95, message: 'Finalizing deployment...' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setDeploymentProgress(step.progress);
        setMessage({ type: 'info', content: step.message });
      }
      
      const response = await axios.post('/portfolio/deploy', {
        templateId: selectedTemplate,
        username: username
      });
      
      if (response.data.success) {
        setDeploymentStatus('deployed');
        setDeploymentProgress(100);
        
        const deployedUrl = response.data.portfolioUrl || `${PORTFOLIO_BASE_URL}/portfolio/${username}`;
        setPortfolioUrl(deployedUrl);
        
        setMessage({
          type: 'success',
          content: 'Portfolio deployed successfully!'
        });
        
        setUserData(prev => ({
          ...prev,
          portfolioDeployed: true,
          portfolioUrl: deployedUrl
        }));
        
      } else {
        throw new Error(response.data.message || 'Deployment failed');
      }
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentStatus('error');
      setDeploymentProgress(0);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to deploy portfolio. Please try again.'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Redeploy portfolio
  const redeployPortfolio = async () => {

    setMessage({
      type: 'success',
      content:"This feature will be rolled out soon!"
    })
    return;

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

  // Unpublish portfolio
const unpublishPortfolio = async () => {
  try {
    setIsDeploying(true);
    setMessage({ type: 'info', content: 'Unpublishing your portfolio...' });
    
    const response = await axios.patch('/portfolio/unpublish');
    
    if (response.data.success) {
      setMessage({
        type: 'success',
        content: 'Portfolio unpublished successfully!'
      });
      
      window.location.reload();
    } else {
      throw new Error(response.data.message || 'Unpublish failed');
    }
  } catch (error) {
    console.error('Unpublish failed:', error);
    setMessage({
      type: 'error',
      content: error.response?.data?.message || 'Failed to unpublish portfolio.'
    });
  } finally {
    setIsDeploying(false);
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

  const getStatusConfig = () => {
    switch (deploymentStatus) {
      case 'checking':
        return {
          icon: <Loader2 className="w-12 h-12 animate-spin text-blue-500" />,
          title: 'Checking Status',
          subtitle: 'Loading your deployment information...',
          bgGradient: 'from-blue-500/10 to-indigo-500/10',
          borderColor: 'border-blue-200'
        };
      case 'deploying':
        return {
          icon: <Rocket className="w-12 h-12 text-blue-500 animate-pulse" />,
          title: 'Deploying Portfolio',
          subtitle: 'Your portfolio is being deployed...',
          bgGradient: 'from-blue-500/10 to-indigo-500/10',
          borderColor: 'border-blue-200'
        };
      case 'deployed':
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          title: 'Portfolio Live!',
          subtitle: 'Your portfolio is successfully deployed and accessible',
          bgGradient: 'from-green-500/10 to-emerald-500/10',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-500" />,
          title: 'Deployment Error',
          subtitle: 'Something went wrong with your deployment',
          bgGradient: 'from-red-500/10 to-pink-500/10',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Globe className="w-12 h-12 text-blue-500" />,
          title: 'Ready to Deploy',
          subtitle: 'Your portfolio is ready for deployment',
          bgGradient: 'from-blue-500/10 to-indigo-500/10',
          borderColor: 'border-blue-200'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <Navbar current={"/portfolio"}/>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Portfolio Deployment
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Deploy your professional portfolio and showcase your work to the world
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          {/* Message Toast */}
          {message.content && (
            <div className={`fixed top-20 right-4 z-50 rounded-2xl p-4 flex items-center space-x-3 shadow-2xl backdrop-blur-sm max-w-sm transform transition-all duration-300 ${
              message.type === 'success'
                ? 'bg-green-500/90 text-white'
                : message.type === 'error'
                ? 'bg-red-500/90 text-white'
                : message.type === 'warning'
                ? 'bg-yellow-500/90 text-white'
                : 'bg-blue-500/90 text-white'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.content}</span>
              <button
                onClick={() => setMessage({ type: '', content: '' })}
                className="ml-2 text-white/80 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          )}

          {/* Main Status Card */}
          <div className={`bg-gradient-to-br ${statusConfig.bgGradient} backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border ${statusConfig.borderColor} bg-white/80`}>
            <div className="text-center mb-8">
              <div className="mb-6">
                {statusConfig.icon}
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                {statusConfig.title}
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                {statusConfig.subtitle}
              </p>
              
              {/* User Info Cards */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {username && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/40">
                    <span className="text-sm text-slate-600">Username</span>
                    <div className="font-semibold text-slate-800">@{username}</div>
                  </div>
                )}
                {selectedTemplate && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/40">
                    <span className="text-sm text-slate-600">Template</span>
                    <div className="font-semibold text-slate-800">{selectedTemplate}</div>
                  </div>
                )}
                {deploymentStatus === 'deployed' && (
                  <div className="bg-green-100/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-200/40">
                    <span className="text-sm text-green-600">Status</span>
                    <div className="font-semibold text-green-800 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar for Deployment */}
              {deploymentStatus === 'deploying' && (
                <div className="w-full max-w-md mx-auto mb-6">
                  <div className="bg-white/40 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${deploymentProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{Math.round(deploymentProgress)}% complete</p>
                </div>
              )}
            </div>

            {/* Portfolio URL Display */}
            {deploymentStatus === 'deployed' && portfolioUrl && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/40">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Your Portfolio URL
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 break-all">
                    {portfolioUrl}
                  </div>
                  <button
                    onClick={copyPortfolioUrl}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
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
                  className="group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-bold text-lg shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                      Deploy Portfolio
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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
                    className="group bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 font-bold text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105"
                  >
                    <ExternalLink className="w-6 h-6 mr-3" />
                    View Live Portfolio
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <button
                    onClick={unpublishPortfolio}
                    className="bg-white/80 backdrop-blur-sm border-2 cursor-pointer border-slate-300 text-slate-700 px-8 py-4 rounded-2xl hover:bg-white hover:border-slate-400 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-105"
                  >
                    <EyeOff className="w-6 h-6 mr-3" />
                    Unpublish Portfolio
                  </button>

                  <button
                    onClick={redeployPortfolio}
                    disabled={isDeploying}
                    className="bg-white/80 backdrop-blur-sm border-2 cursor-pointer border-blue-300 text-blue-700 px-8 py-4 rounded-2xl hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 transform hover:scale-105"
                  >
                    {isDeploying ? (
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-6 h-6 mr-3" />
                    )}
                    Update Portfolio
                  </button>
                </>
              )}

              {deploymentStatus === 'error' && (
                <button
                  onClick={checkDeploymentStatus}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-bold text-lg shadow-2xl hover:shadow-3xl flex items-center justify-center transform hover:scale-105"
                >
                  <RefreshCw className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  Try Again
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* Portfolio Preview */}
          {deploymentStatus === 'deployed' && portfolioUrl && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/40">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Portfolio Preview</h3>
                  <p className="text-slate-600">See how your portfolio looks across devices</p>
                </div>
                
                {/* View Mode Controls */}
                <div className="flex items-center space-x-1 bg-slate-100 rounded-2xl p-1 mt-4 lg:mt-0">
                  {[
                    { mode: 'desktop', icon: Monitor, label: 'Desktop' },
                    { mode: 'tablet', icon: Tablet, label: 'Tablet' },
                    { mode: 'mobile', icon: Smartphone, label: 'Mobile' }
                  ].map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                        viewMode === mode
                          ? 'bg-white text-slate-800 shadow-lg'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                      }`}
                      title={label}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Iframe Preview */}
              <div className="relative">
                <div className={`mx-auto transition-all duration-500 ease-in-out ${
                  viewMode === 'tablet' ? 'max-w-3xl' : 
                  viewMode === 'mobile' ? 'max-w-md' : 'w-full'
                }`}>
                  <div className="bg-slate-900 rounded-2xl p-2 shadow-2xl">
                    <div className="bg-white rounded-xl overflow-hidden">
                      <div className="bg-slate-100 px-4 py-2 flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-slate-600 font-mono">
                          {portfolioUrl}
                        </div>
                      </div>
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
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => window.location.href = '/profile'}
              className="cursor-pointer group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/40 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Edit3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Edit Profile</h3>
              <p className="text-slate-600 leading-relaxed">Update your information and redeploy with fresh content</p>
            </button>

            <button
              onClick={() => window.location.href = '/templates'}
              className="cursor-pointer group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/40 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Change Template</h3>
              <p className="text-slate-600 leading-relaxed">Switch to a different design that matches your style</p>
            </button>

            <button
              onClick={() => portfolioUrl && window.open(portfolioUrl, '_blank')}
              disabled={!portfolioUrl}
              className="cursor-pointer group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/40 hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">View Live</h3>
              <p className="text-slate-600 leading-relaxed">See your portfolio in action and share it with others</p>
            </button>
          </div>

          {/* Statistics Cards */}
          {deploymentStatus === 'deployed' && (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Deployment Time</p>
                    <p className="text-2xl font-bold text-slate-800">{"< 2 min"}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-200/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Performance</p>
                    <p className="text-2xl font-bold text-slate-800">Optimized</p>
                  </div>
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Accessibility</p>
                    <p className="text-2xl font-bold text-slate-800">100%</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <Footer/>
      </div>
    </>
  );
};

export default PortfolioDeployment;