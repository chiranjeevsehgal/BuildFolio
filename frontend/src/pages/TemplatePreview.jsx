// TemplatePreview.jsx - Separate page for template preview
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Tablet, Smartphone, Download, Share2, Settings, Eye, ExternalLink } from 'lucide-react';
import axios from 'axios';

// Import your actual template component
import ModernTemplate from '../templates/ModernTemplate';

const TemplatePreview = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('desktop');
  const [message, setMessage] = useState({ type: "", content: "" })
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState({
    personalInfo: {
      phone: "",
      location: "",
      socialLinks: {
        linkedin: "",
        github: "",
      },
    },
    professional: {
      title: "",
      summary: "",
      skills: [],
    },
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  })

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  
  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.profile) {
          const profile = data.profile

          setUserData(profile)
          // setUserData({
          //   personalInfo: {
          //     phone: profile.phone || "",
          //     location: profile.location || "",
          //     website: profile.website || "",
          //     socialLinks: profile.socialLinks || { linkedin: "", github: "" },
          //   },
          //   professional: {
          //     title: profile.title || "",
          //     summary: profile.summary || "",
          //     skills: profile.skills || [],
          //   },
          //   experience: (profile.experience || []).map((exp) => ({
          //     ...exp,
          //     startDate: formatDateForInput(exp.startDate),
          //     endDate: formatDateForInput(exp.endDate),
          //   })),
          //   education: (profile.education || []).map((edu) => ({
          //     ...edu,
          //     startDate: formatDateForInput(edu.startDate),
          //     endDate: formatDateForInput(edu.endDate),
          //   })),
          //   projects: profile.projects || [],
          //   certifications: profile.certifications || [],
          // })
          setProfilePhoto(profile.profilePhoto)
          console.log(profile);
          
        }
      } else {
        throw new Error("Failed to load profile")
      }
    } catch (error) {
      console.error("Load profile error:", error)
      setMessage({
        type: "error",
        content: "Failed to load profile data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPreviewData();
  }, [templateId]);

  const loadPreviewData = async () => {
    try {
      setLoading(true);

      // Set up axios defaults
      axios.defaults.baseURL = API_BASE_URL;
      const token = localStorage.getItem('authToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      loadProfile()
      
      setTimeout(() => {
        setTemplateData({
          id: templateId,
          name: 'Modern Professional',
          component: ModernTemplate
        });
        setLoading(false);
      }, 1000);

      // Real API calls would be:
      // const [templateResponse, userResponse] = await Promise.all([
      //   axios.get(`/api/templates/${templateId}`),
      //   axios.get('/api/auth/profile')
      // ]);
      // setTemplateData(templateResponse.data.template);
      // setUserData(userResponse.data.user);

    } catch (error) {
      console.error('Failed to load preview data:', error);
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
        // Return empty string if no date provided
        if (!dateString) return ""

        try {
            // Create Date object from ISO string
            const date = new Date(dateString)

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn("Invalid date format:", dateString)
                return ""
            }

            // Get year (4 digits)
            const year = date.getFullYear()

            // Get month (1-12) and pad with zero if needed (01-12)
            const month = String(date.getMonth() + 1).padStart(2, "0")

            // Return in yyyy-MM format
            return `${year}-${month}`
        } catch (error) {
            console.warn("Error formatting date:", dateString, error)
            return ""
        }
    }


  const handleSelectTemplate = async () => {
    try {
      await axios.patch('/api/user/template', {
        selectedTemplate: templateId
      });
      navigate('/templates?selected=' + templateId);
    } catch (error) {
      console.error('Failed to select template:', error);
    }
  };

  const handleExportPreview = () => {
    // Export current preview as HTML/PDF
    window.print();
  };

  const handleSharePreview = async () => {
    const shareUrl = `${window.location.origin}/preview/${templateId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${templateData?.name} Template Preview`,
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Preview link copied to clipboard!');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template preview...</p>
        </div>
      </div>
    );
  }

  if (!templateData || !userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Template Not Found</h2>
          <p className="text-gray-600 mb-4">The requested template could not be loaded.</p>
          <button
            onClick={() => navigate('/templates')}
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
      {/* Preview Controls - Hidden in fullscreen */}
      {!isFullscreen && (
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left Side - Back and Template Info */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/templates')}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Templates
                </button>

                <div className="border-l border-gray-300 pl-4">
                  <h1 className="font-semibold text-gray-800">{templateData.name}</h1>
                  <p className="text-sm text-gray-600">Template Preview</p>
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
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${viewMode === mode
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
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Toggle Fullscreen"
                >
                  <Eye className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSharePreview}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Share Preview"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  onClick={handleExportPreview}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export as PDF"
                >
                  <Download className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSelectTemplate}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
          className="fixed top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-50"
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
                    <span className="ml-2 font-medium text-gray-800">Professional</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Responsive:</span>
                    <span className="ml-2 font-medium text-green-600">✓ Yes</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Export Formats:</span>
                    <span className="ml-2 font-medium text-gray-800">HTML, PDF</span>
                  </div>
                </div>
              </div>

              {/* Sections Included */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sections Included</h3>
                <div className="space-y-2 text-sm">
                  {[
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
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => window.open(`/portfolio/${templateId}`, '_blank')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live Demo
                  </button>

                  <button
                    onClick={handleExportPreview}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Preview
                  </button>

                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePreview;
