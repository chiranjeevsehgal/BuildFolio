import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Tablet, Smartphone, Download, Share2, Settings, Eye, ExternalLink, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getTemplateComponent, isValidTemplateId } from '../templates/TemplateRegistry';
import { getMockUserData } from '../utils/mockData';
import { getTemplateById } from '../utils/templateData';
import toast, { Toaster } from 'react-hot-toast';

const TemplatePreview = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('desktop');
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

          if (profile.isProfileCompleted === false) {
            setUserData(getMockUserData());
            return;
          }

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

          setUserData(mappedUserData);
        }
      } else {
        throw new Error("Failed to load profile");
      }
    } catch (error) {
      console.error("Load profile error:", error);
      toast.error("Failed to load profile data")
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

      // Fetch template data
      try {
        const templateResponse = await getTemplateById(templateId);
        console.log(templateResponse);

        if (templateResponse.success) {
          const template = templateResponse.data;

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
      toast.error(error.message)
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
      toast.error('Invalid template ID format. Template IDs can only contain lowercase letters, numbers, and hyphens.')
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

      toast.success('Template selected successfully!')

      setTimeout(() => {
        navigate('/templates?selected=' + templateId);
      }, 1500);

    } catch (error) {
      console.error('Failed to select template:', error);
      toast.error(error.response?.data?.message || 'Failed to select template. Please try again.')
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

  // Loading state
  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading template preview...</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 break-all">Template: {templateId}</p>
        </div>
      </div>
    );
  }

  // Error state - Template not found or failed to load
  if (!templateData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-xs sm:max-w-md mx-auto p-4 sm:p-6">
          <AlertCircle className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">Template Not Available</h2>

          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => navigate('/templates')}
              className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              Browse Available Templates
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Retry Loading
            </button>
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs sm:text-sm text-yellow-800">
              <strong>Template ID:</strong> <span className="break-all">{templateId}</span>
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">Unable to Load Template</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">The template component could not be initialized.</p>
          <button
            onClick={() => { navigate('/templates') }}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
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

      {/* Preview Controls - Hidden in fullscreen */}
      {!isFullscreen && (
        <div className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Left Side - Back and Template Info */}
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                <button
                  onClick={() => navigate('/templates')}
                  className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="text-sm sm:text-base">Back</span>
                  <span className="hidden sm:inline ml-1">to Templates</span>
                </button>

                <div className="border-l border-gray-300 pl-2 sm:pl-4 min-w-0 flex-1">
                  <h1 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{templateData.name}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    <span className="hidden sm:inline">Template Preview • </span>
                    {templateData.category}
                  </p>
                </div>
              </div>

              {/* Right Side - Action Buttons */}
              <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-shrink-0">
                <button
                  onClick={toggleFullscreen}
                  className="cursor-pointer p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Toggle Fullscreen"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={handleSelectTemplate}
                  className="cursor-pointer bg-blue-600 text-white px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm lg:text-base"
                >
                  <span className="hidden sm:inline">Select This Template</span>
                  <span className="sm:hidden">Select</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Area */}
      <div className={`${isFullscreen ? '' : 'py-4 sm:py-6 lg:py-8 px-2 sm:px-4'}`}>
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
          className="fixed cursor-pointer top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-50 text-white p-2 sm:p-3 rounded-full hover:bg-opacity-70 transition-all z-50"
          title="Exit Fullscreen"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Template Details Panel - Only show when not fullscreen */}
      {!isFullscreen && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Template Info */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Template Details</h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-500 sm:w-24 sm:flex-shrink-0">Template ID:</span>
                    <span className="font-medium text-gray-800 break-all sm:ml-2">{templateData.id}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-500 sm:w-24 sm:flex-shrink-0">Category:</span>
                    <span className="font-medium text-gray-800 capitalize sm:ml-2">{templateData.category}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-500 sm:w-24 sm:flex-shrink-0">Responsive:</span>
                    <span className="font-medium text-green-600 sm:ml-2">
                      {templateData.responsive ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <span className="text-gray-500 sm:w-24 sm:flex-shrink-0">Export Formats:</span>
                    <span className="font-medium text-gray-800 sm:ml-2">
                      {templateData.exportFormats.join(', ')}
                    </span>
                  </div>
                  {templateData.rating && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-500 sm:w-24 sm:flex-shrink-0">Rating:</span>
                      <span className="font-medium text-gray-800 sm:ml-2">
                        {templateData.rating}/5 ⭐
                      </span>
                    </div>
                  )}
                  {templateData.downloads && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-500 sm:w-24 sm:flex-shrink-0">Downloads:</span>
                      <span className="font-medium text-gray-800 sm:ml-2">{templateData.downloads}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sections Included */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Sections Included</h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {templateData.sections.length > 0 ? (
                    templateData.sections.map((section, index) => (
                      <div key={index} className="flex items-center text-gray-600">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                        <span>{section}</span>
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
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                        <span>{section}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Quick Actions</h3>
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={handleExportPreview}
                    className="w-full flex items-center cursor-pointer justify-center px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="hidden sm:inline">Download Preview</span>
                    <span className="sm:hidden">Download</span>
                  </button>

                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center cursor-pointer justify-center px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="hidden sm:inline">Edit Profile Data</span>
                    <span className="sm:hidden">Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Template Description */}
            {templateData.description && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">About This Template</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{templateData.description}</p>
              </div>
            )}

            {/* Template Features */}
            {templateData.features && templateData.features.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Key Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
                  {templateData.features.map((feature, index) => (
                    <div key={index} className="flex items-start text-xs sm:text-sm text-gray-600">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full mr-2 mt-1.5 sm:mt-2 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Toaster
        position="top-center"
        reverseOrder={true}
      />
    </div>
  );
};

export default TemplatePreview;