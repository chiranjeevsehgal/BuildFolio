// TemplatePreview.jsx - Updated with correct data mapping
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Tablet, Smartphone, Download, Share2, Settings, Eye, ExternalLink, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getTemplateComponent, isValidTemplateId } from '../templates/TemplateRegistry';

const TemplatePreview = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('desktop');
  const [message, setMessage] = useState({ type: "", content: "" });
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Load user profile data and map to expected format
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          const profile = data.profile;
          console.log('Profile data received:', profile);
          
          // Map the API response to the expected template format
          const mappedUserData = {
            // Basic user info
            firstName: profile.user?.firstName || '',
            lastName: profile.user?.lastName || '',
            email: profile.user?.email || '',
            username: profile.user?.username || '',
            profilePhoto: profile.profilePhoto || null,
            
            // Personal info structure
            personalInfo: {
              phone: profile.phone || '',
              location: profile.location || '',
              socialLinks: {
                linkedin: profile.socialLinks?.linkedin || '',
                github: profile.socialLinks?.github || '',
                twitter: profile.socialLinks?.twitter || '',
                website: profile.socialLinks?.website || ''
              }
            },
            
            // Professional info structure
            professional: {
              title: profile.title || '',
              summary: profile.summary || '',
              skills: profile.skills || []
            },
            
            // Direct arrays (already in correct format)
            experience: profile.experience || [],
            education: profile.education || [],
            projects: profile.projects || [],
            certifications: profile.certifications || [],
            
            // Additional metadata
            isPublic: profile.isPublic || false,
            completionPercentage: profile.completionPercentage || 0,
            showContactInfo: profile.showContactInfo !== false, // Default to true
            
            // SEO data if available
            seoData: {
              title: profile.user ? `${profile.user.firstName} ${profile.user.lastName} - Portfolio` : 'Portfolio',
              description: profile.summary || 'Professional portfolio',
              keywords: profile.skills ? profile.skills.join(', ') : ''
            }
          };
          
          console.log('Mapped user data:', mappedUserData);
          setUserData(mappedUserData);
        }
      } else {
        throw new Error("Failed to load profile");
      }
    } catch (error) {
      console.error("Load profile error:", error);
      setMessage({
        type: "error",
        content: "Failed to load profile data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load template data from API and map to component
  const loadPreviewData = async () => {
    try {
      setLoading(true);

      // Validate template ID first
      if (!templateId) {
        throw new Error('Template ID is required');
      }

      if (!isValidTemplateId(templateId)) {
        throw new Error(`Template "${templateId}" is not available. Please check the template ID.`);
      }

      // Set up axios defaults
      axios.defaults.baseURL = API_BASE_URL;
      const token = localStorage.getItem('authToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Load user profile
      await loadProfile();

      // Fetch template data from API
      try {
        const templateResponse = await axios.get(`/templates/${templateId}`);
        
        if (templateResponse.data.success) {
          const template = templateResponse.data.data;
          
          // Get the component from registry
          const templateInfo = getTemplateComponent(templateId);
          
          if (!templateInfo) {
            throw new Error(`Template component not found for ID: ${templateId}`);
          }
          
          setTemplateData({
            id: template.templateId,
            name: template.name,
            category: template.category,
            description: template.description,
            features: template.features || [],
            sections: template.sections || [],
            rating: template.rating,
            downloads: template.downloads,
            responsive: template.responsive,
            exportFormats: template.exportFormats || ['HTML', 'PDF'],
            component: templateInfo.component
          });

          // Clear any previous error messages
          setMessage({ type: "", content: "" });
          
        } else {
          throw new Error(templateResponse.data.message || 'Template not found');
        }
        
      } catch (apiError) {
        console.error('API error:', apiError);
        
        if (apiError.response?.status === 404) {
          throw new Error(`Template "${templateId}" not found in database`);
        } else if (apiError.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(apiError.response?.data?.message || 'Failed to load template data');
        }
      }

    } catch (error) {
      console.error('Failed to load preview data:', error);
      setMessage({
        type: "error",
        content: error.message
      });
      setTemplateData(null);
    } finally {
      setLoading(false);
    }
  };

  // Effect to validate and load data when templateId changes
  useEffect(() => {
    if (!templateId) {
      navigate('/templates');
      return;
    }

    // Validate template ID format
    if (!/^[a-z0-9-]+$/.test(templateId)) {
      setMessage({
        type: 'error',
        content: 'Invalid template ID format. Template IDs can only contain lowercase letters, numbers, and hyphens.'
      });
      setLoading(false);
      return;
    }

    loadPreviewData();
  }, [templateId]);

  const handleSelectTemplate = async () => {
    try {
      await axios.patch('/profiles/template', {
        selectedTemplate: templateId
      });
      
      setMessage({
        type: 'success',
        content: 'Template selected successfully!'
      });
      
      setTimeout(() => {
        navigate('/templates?selected=' + templateId);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to select template:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to select template. Please try again.'
      });
    }
  };

  const handleExportPreview = () => {
    // Export current preview as HTML/PDF
    window.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getViewModeStyles = () => {
    switch (viewMode) {
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'mobile':
        return 'max-w-sm mx-auto';
      default:
        return 'w-full';
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.content) {
      const timer = setTimeout(() => {
        setMessage({ type: "", content: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.content]);

  // Loading state
  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template preview...</p>
          <p className="text-sm text-gray-500 mt-2">Template: {templateId}</p>
        </div>
      </div>
    );
  }

  // Error state - Template not found or failed to load
  if (!templateData && message.type === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Template Not Available</h2>
          <p className="text-gray-600 mb-6">{message.content}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/templates')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Available Templates
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retry Loading
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Template ID:</strong> {templateId}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Final validation before rendering
  if (!templateData || !templateData.component) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Template</h2>
          <p className="text-gray-600 mb-4">The template component could not be initialized.</p>
          <button
            onClick={() => {navigate('/templates')}}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  const TemplateComponent = templateData.component;

  return (
    <div className={`min-h-screen ${isFullscreen ? 'bg-white' : 'bg-gray-100'}`}>
      {/* Success/Error Messages */}
      {message.content && !isFullscreen && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : message.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{message.content}</p>
            <button
              onClick={() => setMessage({ type: "", content: "" })}
              className="ml-3 text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Preview Controls - Hidden in fullscreen */}
      {!isFullscreen && (
        <div className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left Side - Back and Template Info */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/templates')}
                  className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Templates
                </button>

                <div className="border-l border-gray-300 pl-4">
                  <h1 className="font-semibold text-gray-800">{templateData.name}</h1>
                  <p className="text-sm text-gray-600">Template Preview • {templateData.category}</p>
                </div>
              </div>

              {/* Center - View Mode Controls */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { mode: 'desktop', icon: Monitor, label: 'Desktop' },
                  { mode: 'tablet', icon: Tablet, label: 'Tablet' },
                  { mode: 'mobile', icon: Smartphone, label: 'Mobile' }
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      viewMode === mode
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>

              {/* Right Side - Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleFullscreen}
                  className="cursor-pointer p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Toggle Fullscreen"
                >
                  <Eye className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSelectTemplate}
                  className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Select This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Area */}
      <div className={`${isFullscreen ? '' : 'py-8 px-4'}`}>
        <div className={`transition-all duration-300 ${getViewModeStyles()}`}>
          {/* Preview Frame */}
          <div className={`${isFullscreen ? '' : 'bg-white rounded-lg shadow-lg overflow-hidden'}`}>
            <TemplateComponent userData={userData} />
          </div>
        </div>
      </div>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed cursor-pointer top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-50"
          title="Exit Fullscreen"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Template Details Panel - Only show when not fullscreen */}
      {!isFullscreen && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Template Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Template Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Template ID:</span>
                    <span className="ml-2 font-medium text-gray-800">{templateData.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium text-gray-800 capitalize">{templateData.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Responsive:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {templateData.responsive ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Export Formats:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {templateData.exportFormats.join(', ')}
                    </span>
                  </div>
                  {templateData.rating && (
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <span className="ml-2 font-medium text-gray-800">
                        {templateData.rating}/5 ⭐
                      </span>
                    </div>
                  )}
                  {templateData.downloads && (
                    <div>
                      <span className="text-gray-500">Downloads:</span>
                      <span className="ml-2 font-medium text-gray-800">{templateData.downloads}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sections Included */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sections Included</h3>
                <div className="space-y-2 text-sm">
                  {templateData.sections.length > 0 ? (
                    templateData.sections.map((section, index) => (
                      <div key={index} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        {section}
                      </div>
                    ))
                  ) : (
                    // Default sections if not provided by API
                    [
                      'Hero with Contact Info',
                      'Skills & Expertise',
                      'Professional Experience',
                      'Featured Projects',
                      'Education',
                      'Contact Footer'
                    ].map((section, index) => (
                      <div key={index} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        {section}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  
                  <button
                    onClick={handleExportPreview}
                    className="w-full flex items-center cursor-pointer justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Preview
                  </button>

                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center cursor-pointer justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile Data
                  </button>
                </div>
              </div>
            </div>

            {/* Template Description */}
            {templateData.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About This Template</h3>
                <p className="text-gray-600 leading-relaxed">{templateData.description}</p>
              </div>
            )}

            {/* Template Features */}
            {templateData.features && templateData.features.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Key Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {templateData.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePreview;