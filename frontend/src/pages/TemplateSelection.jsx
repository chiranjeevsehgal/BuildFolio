// TemplateSelection.jsx - Improved version with better UX
import React, { useState, useEffect } from 'react';
import { Eye, ArrowRight, Palette, Monitor, Smartphone, Tablet, Check, Star, Zap, Heart, Grid, Layout, Code, Briefcase, User, Crown, AlertCircle, Edit3 } from 'lucide-react';
import axios from 'axios';

const TemplateSelection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userSelectedTemplate, setUserSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');
  const [filterCategory, setFilterCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [savingTemplate, setSavingTemplate] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid },
    { id: 'minimal', name: 'Minimal', icon: Layout },
    { id: 'creative', name: 'Creative', icon: Palette },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'developer', name: 'Developer', icon: Code }
  ];

  useEffect(() => {
    // Set up axios defaults
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Load both templates and user's current selection
    loadTemplatesAndUserSelection();
  }, [API_BASE_URL]);

  // Auto-dismiss messages after 4 seconds
  useEffect(() => {
    if (message.content) {
      const timer = setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.content]);

  // Updated function to load templates and user's current selection
  const loadTemplatesAndUserSelection = async () => {
    try {
      setLoading(true);

      // Make parallel requests for templates and user profile
      const [templatesResponse, userResponse] = await Promise.all([
        axios.get('/templates'),
        axios.get('/auth/profile') // Get user profile with selected template
      ]);

      // Handle templates response
      if (templatesResponse.data.success) {
        setTemplates(templatesResponse.data.data);
      } else {
        throw new Error(templatesResponse.data.message || 'Failed to load templates');
      }

      // Handle user response and set selected template (without showing message)
      if (userResponse.data.success && userResponse.data.user) {
        const user = userResponse.data.user;
        
        if (user.selectedTemplate) {
          setSelectedTemplate(user.selectedTemplate);
          setUserSelectedTemplate(user.selectedTemplate);
        }
      }

    } catch (error) {
      console.error('Failed to load data:', error);

      // Try to load templates only if user profile fails
      if (error.config?.url?.includes('/auth/profile')) {
        try {
          const templatesResponse = await axios.get('/templates');
          if (templatesResponse.data.success) {
            setTemplates(templatesResponse.data.data);
          }
        } catch (templateError) {
          console.error('Failed to load templates:', templateError);
        }
      } else {
        setMessage({
          type: 'error',
          content: error.response?.data?.message || 'Failed to load templates. Please try again.'
        });
      }

    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = filterCategory === 'all'
    ? templates
    : templates.filter(template => template.category === filterCategory);

  // Update handleTemplateSelect to prevent re-selecting the same template
  const handleTemplateSelect = async (template) => {
    const templateId = template.templateId || template.id;
    
    // Don't allow selecting the same template again
    if (selectedTemplate === templateId && userSelectedTemplate === templateId) {
      return;
    }
    
    // Optimistic update
    setSelectedTemplate(templateId);
    setSavingTemplate(true);

    // Save selection to backend
    try {
      const response = await axios.patch('/profiles/template', {
        selectedTemplate: templateId
      });

      if (response.data.success) {
        setUserSelectedTemplate(templateId);
        setMessage({
          type: 'success',
          content: 'Template selected and saved successfully!'
        });
      } else {
        throw new Error(response.data.message || 'Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template selection:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to save template selection. Please try again.'
      });
      
      // Revert selection on error
      setSelectedTemplate(userSelectedTemplate);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleChangeTemplate = async (template) => {
    const templateId = template.templateId || template.id;
    
    // Optimistic update
    setSelectedTemplate(templateId);
    setSavingTemplate(true);

    // Save selection to backend
    try {
      const response = await axios.patch('/profiles/template', {
        selectedTemplate: templateId
      });

      if (response.data.success) {
        setUserSelectedTemplate(templateId);
        setMessage({
          type: 'success',
          content: 'Template updated successfully!'
        });
        console.log('Template updated successfully:', templateId);
      } else {
        throw new Error(response.data.message || 'Failed to update template');
      }
    } catch (error) {
      console.error('Failed to update template selection:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to update template selection. Please try again.'
      });
      
      // Revert selection on error
      setSelectedTemplate(userSelectedTemplate);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    const templateId = template.templateId || template.id;
    // Open preview in new window/modal
    window.open(`/preview/${templateId}`, '_blank', 'width=1200,height=800');
  };

  const handleContinue = async () => {
    if (selectedTemplate && userSelectedTemplate) {
      try {
        // Navigate to portfolio deployment page
        window.location.href = '/portfolio';
      } catch (error) {
        console.error('Failed to navigate to portfolio:', error);
        setMessage({
          type: 'error',
          content: 'Failed to proceed. Please try again.'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Choose Your Perfect Template
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Select a professional template that matches your style and industry.
            All templates are fully responsive and optimized for performance.
          </p>
        </div>

        {/* Message Display - Only show for actions, not on load */}
        {message.content && message.type !== 'info' && (
          <div className={`fixed top-4 right-4 z-50 rounded-lg p-4 flex items-center space-x-3 shadow-lg max-w-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : message.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0" />
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

        {/* Filters and View Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setFilterCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      filterCategory === category.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Template Count and Status */}
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-slate-600">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
              </span>
              {userSelectedTemplate && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  Template Selected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid lg:grid-cols-1 xl:grid-cols-1 gap-8 mb-12">
          {filteredTemplates.map((template) => {
            const templateId = template.templateId || template.id;
            const isSelected = selectedTemplate === templateId;
            const isSaved = userSelectedTemplate === templateId;
            const isCurrentlySelected = isSelected && isSaved;
            
            return (
              <div
                key={templateId}
                className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                  isCurrentlySelected
                    ? 'border-green-500 ring-2 ring-green-200 bg-green-50/30'
                    : isSelected
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Template Preview */}
                <div className="lg:flex">
                  <div className="lg:w-1/2">
                    <div className="aspect-[4/3] lg:aspect-[3/2] bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none overflow-hidden relative">
                      {/* Enhanced template preview */}
                      <div className="w-full h-full flex items-center justify-center p-8">
                        <div className="text-center">
                          <div className={`w-20 h-20 bg-gradient-to-r ${
                            isCurrentlySelected 
                              ? 'from-green-500 via-emerald-500 to-teal-600' 
                              : 'from-blue-500 via-purple-500 to-indigo-600'
                          } rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transition-all duration-300`}>
                            {isCurrentlySelected ? (
                              <Check className="w-10 h-10 text-white" />
                            ) : (
                              <Layout className="w-10 h-10 text-white" />
                            )}
                          </div>
                          <h3 className="font-bold text-xl text-slate-800 mb-3">{template.name}</h3>
                          <div className="flex justify-center space-x-2 mb-4">
                            {template.colors?.map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: color }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="absolute top-4 right-4 flex flex-col space-y-2">
                        {/* {template.isPremium && (
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Crown className="w-4 h-4 mr-1" />
                            Premium
                          </div>
                        )} */}
                        {isCurrentlySelected && (
                          <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            Active
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-4 left-4 flex space-x-2">
                        <button
                          onClick={() => handlePreview(template)}
                          className="bg-white/90 backdrop-blur-sm text-slate-700 p-2 rounded-lg hover:bg-white transition-all duration-200 shadow-sm"
                          title="Preview Template"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="lg:w-1/2 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{template.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                         
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Sections Included */}
                    {template.sections && template.sections.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Template Sections</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {template.sections.slice(0, 4).map((section, index) => (
                            <div key={index} className="flex items-center text-sm text-slate-600">
                              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {section}
                            </div>
                          ))}
                          {template.sections.length > 4 && (
                            <div className="text-sm text-slate-500 italic">
                              +{template.sections.length - 4} more sections
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Key Features */}
                    {template.features && template.features.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Key Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {template.features.slice(0, 4).map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-slate-600">
                              <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {template.tags.slice(0, 4).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      {isCurrentlySelected ? (
                        // Currently selected template - show change option
                        <button
                          onClick={() => handleChangeTemplate(template)}
                          disabled={savingTemplate}
                          className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 bg-green-600 text-white shadow-lg cursor-default"
                        >
                          <div className="flex items-center justify-center">
                            <Check className="w-5 h-5 mr-2" />
                            Currently Selected
                          </div>
                        </button>
                      ) : (
                        // Not selected - show select button
                        <button
                          onClick={() => handleTemplateSelect(template)}
                          disabled={savingTemplate && isSelected}
                          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {savingTemplate && isSelected ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Saving...
                            </div>
                          ) : isSelected ? (
                            <div className="flex items-center justify-center">
                              <Check className="w-5 h-5 mr-2" />
                              Selected
                            </div>
                          ) : (
                            'Select Template'
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handlePreview(template)}
                        className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      

                    </div>

                    {/* Selection Status */}
                    {isSelected && !isCurrentlySelected && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {isSaved 
                            ? '✓ This template is selected and saved to your profile.'
                            : '⚠ Selection in progress...'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Templates Found */}
        {filteredTemplates.length === 0 && !loading && (
          <div className="text-center py-12">
            <Layout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No templates found</h3>
            <p className="text-slate-500">Try adjusting your filters to see more templates.</p>
          </div>
        )}

        {/* Selected Template Info - Only show if user has made a selection */}
        {selectedTemplate && userSelectedTemplate && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to Build!</h3>
                <p className="text-green-100">
                  Your "{templates.find(t => (t.templateId || t.id) === selectedTemplate)?.name}" template is ready. 
                  Let's create your professional portfolio!
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedTemplate || !userSelectedTemplate}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            {!selectedTemplate || !userSelectedTemplate ? (
              'Select a Template to Continue'
            ) : (
              <>
                Build My Portfolio
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;