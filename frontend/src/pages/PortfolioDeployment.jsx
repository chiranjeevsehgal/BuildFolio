import React, { useState, useEffect } from 'react';
import { Check, Copy, ExternalLink, Share2, Edit, Eye, BarChart3, Users, Globe, Sparkles, Download, Mail, MessageCircle, Linkedin, Twitter, Facebook, ArrowRight, RefreshCw, Settings, Zap, Heart, Crown } from 'lucide-react';

const PortfolioDeployment = () => {
  const [deploymentStatus, setDeploymentStatus] = useState('deploying'); // 'deploying', 'success', 'error'
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [portfolioUrl, setPortfolioUrl] = useState('https://portfoliogenerator.com/johndoe');
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Simulate deployment progress
  useEffect(() => {
    if (deploymentStatus === 'deploying') {
      const interval = setInterval(() => {
        setDeploymentProgress(prev => {
          if (prev >= 100) {
            setDeploymentStatus('success');
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [deploymentStatus]);

  const deploymentSteps = [
    { id: 1, name: 'Building portfolio structure', completed: deploymentProgress > 20 },
    { id: 2, name: 'Applying template design', completed: deploymentProgress > 40 },
    { id: 3, name: 'Injecting your data', completed: deploymentProgress > 60 },
    { id: 4, name: 'Optimizing for performance', completed: deploymentProgress > 80 },
    { id: 5, name: 'Publishing to web', completed: deploymentProgress >= 100 }
  ];

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.log('Copy failed');
    }
  };

  const handleShare = (platform) => {
    // Backend integration will handle social sharing
    console.log(`Sharing to ${platform}:`, portfolioUrl);
  };

  const handleEditPortfolio = () => {
    // Navigation to edit mode
    console.log('Edit portfolio');
  };

  const handleViewAnalytics = () => {
    // Navigation to analytics dashboard
    console.log('View analytics');
  };

  if (deploymentStatus === 'deploying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-800">PortfolioGenerator</span>
            </div>

            {/* Progress Animation */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="w-24 h-24 border-4 border-slate-200 rounded-full"></div>
                <div 
                  className="w-24 h-24 border-4 border-blue-500 rounded-full absolute top-0 left-0 border-t-transparent animate-spin"
                  style={{
                    background: `conic-gradient(from 0deg, #3b82f6 ${deploymentProgress * 3.6}deg, transparent ${deploymentProgress * 3.6}deg)`
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-700">{Math.round(deploymentProgress)}%</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Building Your Portfolio
              </h2>
              <p className="text-slate-600">
                We're creating your professional portfolio. This will just take a moment...
              </p>
            </div>

            {/* Deployment Steps */}
            <div className="space-y-4">
              {deploymentSteps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-500' : 'bg-slate-200'
                  }`}>
                    {step.completed ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs font-medium text-slate-500">{step.id}</span>
                    )}
                  </div>
                  <span className={`text-sm ${
                    step.completed ? 'text-slate-800 font-medium' : 'text-slate-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            🎉 Your Portfolio is Live!
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Congratulations! Your professional portfolio has been successfully created and deployed.
          </p>
        </div>

        {/* Portfolio URL Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Your Portfolio URL</h2>
            <p className="text-slate-600">Share this link to showcase your professional profile</p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 rounded-xl p-4 mb-6">
            <Globe className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <div className="flex-1 font-mono text-lg text-slate-800 truncate">
              {portfolioUrl}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyUrl}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  copySuccess 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <a
                href={portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit</span>
              </a>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={handleEditPortfolio}
              className="flex items-center justify-center space-x-2 p-4 border border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
            >
              <Edit className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-700">Edit Portfolio</span>
            </button>
            
            <button
              onClick={handleViewAnalytics}
              className="flex items-center justify-center space-x-2 p-4 border border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
            >
              <BarChart3 className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-700">View Analytics</span>
            </button>

            <button className="flex items-center justify-center space-x-2 p-4 border border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200">
              <Settings className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-700">Settings</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex space-x-8 px-8">
              {[
                { id: 'overview', name: 'Overview', icon: Eye },
                { id: 'share', name: 'Share', icon: Share2 },
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'upgrade', name: 'Upgrade', icon: Crown }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Portfolio Summary</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-1">Portfolio Views</h4>
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-sm text-slate-600">Starting fresh!</p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-1">Unique Visitors</h4>
                      <p className="text-2xl font-bold text-green-600">0</p>
                      <p className="text-sm text-slate-600">Ready for visitors</p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-1">Profile Score</h4>
                      <p className="text-2xl font-bold text-purple-600">95%</p>
                      <p className="text-sm text-slate-600">Excellent profile!</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Next Steps</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                      <Share2 className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">Share your portfolio</h4>
                        <p className="text-sm text-slate-600">Let the world see your amazing work</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                      <Edit className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">Customize your design</h4>
                        <p className="text-sm text-slate-600">Make it uniquely yours</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">Track your success</h4>
                        <p className="text-sm text-slate-600">Monitor views and engagement</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Share Tab */}
            {activeTab === 'share' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Share Your Portfolio</h3>
                  <p className="text-slate-600 mb-6">
                    Spread the word about your new portfolio on social media and professional networks.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="flex items-center space-x-3 p-4 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin className="w-6 h-6 text-blue-600" />
                      <div className="text-left">
                        <h4 className="font-medium text-slate-800">LinkedIn</h4>
                        <p className="text-sm text-slate-600">Professional network</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center space-x-3 p-4 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Twitter className="w-6 h-6 text-blue-500" />
                      <div className="text-left">
                        <h4 className="font-medium text-slate-800">Twitter</h4>
                        <p className="text-sm text-slate-600">Share with followers</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center space-x-3 p-4 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Facebook className="w-6 h-6 text-blue-700" />
                      <div className="text-left">
                        <h4 className="font-medium text-slate-800">Facebook</h4>
                        <p className="text-sm text-slate-600">Personal network</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleShare('email')}
                      className="flex items-center space-x-3 p-4 border border-slate-300 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <Mail className="w-6 h-6 text-slate-600" />
                      <div className="text-left">
                        <h4 className="font-medium text-slate-800">Email</h4>
                        <p className="text-sm text-slate-600">Send to contacts</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Download Materials</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button className="flex items-center space-x-3 p-4 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                      <Download className="w-5 h-5 text-slate-600" />
                      <div className="text-left">
                        <h4 className="font-medium text-slate-800">QR Code</h4>
                        <p className="text-sm text-slate-600">For business cards</p>
                      </div>
                    </button>

                    <button className="flex items-center space-x-3 p-4 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                      <Download className="w-5 h-5 text-slate-600" />
                      <div className="text-left">
                        <h4 className="font-medium text-slate-800">Portfolio PDF</h4>
                        <p className="text-sm text-slate-600">Offline version</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Analytics Coming Soon</h3>
                <p className="text-slate-600 mb-6">
                  Your portfolio analytics will appear here once you start getting visitors.
                </p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Share to Get Started
                </button>
              </div>
            )}

            {/* Upgrade Tab */}
            {activeTab === 'upgrade' && (
              <div className="text-center py-12">
                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Upgrade to Premium</h3>
                <p className="text-slate-600 mb-6">
                  Unlock advanced features, custom domains, and detailed analytics.
                </p>
                <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 flex items-center mx-auto">
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Footer */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            Need help or have questions? We're here to support you!
          </p>
          <div className="flex justify-center space-x-4">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </button>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View Tutorial
            </button>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Join Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDeployment;