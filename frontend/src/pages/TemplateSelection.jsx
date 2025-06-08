import React, { useState, useEffect } from 'react';
import { 
  Eye, ArrowRight, Palette, Monitor, Smartphone, Tablet, Check, Star, Zap, Heart, 
  Grid, Layout, Code, Briefcase, User, Crown, AlertCircle, Edit3, Sparkles, 
  Layers, Filter, Search, ChevronDown, ExternalLink, Clock, Award, Rocket
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
    { id: 'all', name: 'All Templates', icon: Grid, gradient: 'from-blue-500 to-indigo-600' },
    { id: 'minimal', name: 'Minimal', icon: Layout, gradient: 'from-slate-500 to-slate-600' },
    { id: 'creative', name: 'Creative', icon: Palette, gradient: 'from-purple-500 to-pink-600' },
    { id: 'professional', name: 'Professional', icon: Briefcase, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'developer', name: 'Developer', icon: Code, gradient: 'from-orange-500 to-red-600' }
  ];

  useEffect(() => {
    // Set up axios defaults
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

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

  const loadTemplatesAndUserSelection = async () => {
    try {
      setLoading(true);

      const [templatesResponse, userResponse] = await Promise.all([
        axios.get('/templates'),
        axios.get('/auth/profile')
      ]);

      if (templatesResponse.data.success) {
        setTemplates(templatesResponse.data.data);
      } else {
        throw new Error(templatesResponse.data.message || 'Failed to load templates');
      }

      if (userResponse.data.success && userResponse.data.user) {
        const user = userResponse.data.user;
        if (user.selectedTemplate) {
          setSelectedTemplate(user.selectedTemplate);
          setUserSelectedTemplate(user.selectedTemplate);
        }
      }

    } catch (error) {
      console.error('Failed to load data:', error);

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

  const handleTemplateSelect = async (template) => {
    const templateId = template.templateId || template.id;

    if (selectedTemplate === templateId && userSelectedTemplate === templateId) {
      return;
    }

    setSelectedTemplate(templateId);
    setSavingTemplate(true);

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
      setSelectedTemplate(userSelectedTemplate);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleChangeTemplate = async (template) => {
    const templateId = template.templateId || template.id;

    setSelectedTemplate(templateId);
    setSavingTemplate(true);

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
      } else {
        throw new Error(response.data.message || 'Failed to update template');
      }
    } catch (error) {
      console.error('Failed to update template selection:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to update template selection. Please try again.'
      });
      setSelectedTemplate(userSelectedTemplate);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    const templateId = template.templateId || template.id;
    window.open(`/preview/${templateId}`, '_blank', 'width=1200,height=800');
  };

  const handleContinue = async () => {
    if (selectedTemplate && userSelectedTemplate) {
      try {
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
      <>
        <Navbar current={"/templates"} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Templates</h3>
              <p className="text-slate-600">Finding the perfect designs for you...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const selectedCategory = categories.find(cat => cat.id === filterCategory);

  return (
    <>
      <Navbar current={"/templates"} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <Palette className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Choose Your Perfect Template
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Select a professional template that matches your style and industry. 
                All templates are fully responsive and optimized for performance.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          {/* Message Toast */}
          {message.content && message.type !== 'info' && (
            <div className={`fixed top-20 right-4 z-50 rounded-2xl p-4 flex items-center space-x-3 shadow-2xl backdrop-blur-sm max-w-sm transform transition-all duration-300 ${
              message.type === 'success'
                ? 'bg-green-500/90 text-white'
                : message.type === 'error'
                ? 'bg-red-500/90 text-white'
                : 'bg-blue-500/90 text-white'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0" />
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

          {/* Filters and Stats */}
          <div className="bg-white/80 backdrop-blur-sm  rounded-3xl shadow-2xl p-8 mb-8 border border-white/40">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isActive = filterCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFilterCategory(category.id)}
                      className={`group relative flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'text-slate-600 border-slate-400 border shadow-xl transform scale-105'
                          : 'bg-white/60 text-slate-600 hover:bg-white hover:shadow-lg transform hover:scale-105'
                      }`}
                      style={{
                        background: isActive ? `linear-gradient(135deg, var(--tw-gradient-stops))` : undefined,
                        '--tw-gradient-from': isActive ? category.gradient.split(' ')[1] : undefined,
                        '--tw-gradient-to': isActive ? category.gradient.split(' ')[3] : undefined,
                      }}
                    >
                      <div className={`${isActive ? '' : 'group-hover:scale-110'} transition-transform duration-200`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-semibold">{category.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6">
                
                {userSelectedTemplate && (
                  <div className="bg-green-100/80 backdrop-blur-sm text-green-800 px-4 py-2 rounded-xl font-semibold flex items-center border border-green-200/50">
                    <Check className="w-4 h-4 mr-2" />
                    Template Selected
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Template Grid */}
          <div className="space-y-8 mb-12">
            {filteredTemplates.map((template) => {
              const templateId = template.templateId || template.id;
              const isSelected = selectedTemplate === templateId;
              const isSaved = userSelectedTemplate === templateId;
              const isCurrentlySelected = isSelected && isSaved;

              return (
                <div
                  key={templateId}
                  className={`group bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 transition-all duration-500 hover:shadow-3xl ${
                    isCurrentlySelected
                      ? 'border-green-500 ring-4 ring-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50'
                      : isSelected
                      ? 'border-blue-500 ring-4 ring-blue-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50'
                      : 'border-white/50 hover:border-slate-300/50'
                  } transform hover:scale-[1.02]`}
                >
                  <div className="lg:flex">
                    {/* Template Preview */}
                    <div className="lg:w-1/2 relative">
                      <div className="aspect-[4/3] lg:aspect-[3/2] bg-gradient-to-br from-slate-100 via-slate-50 to-white rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none overflow-hidden relative">
                        {/* Enhanced Preview */}
                        <div className="w-full h-full flex items-center justify-center p-12">
                          <div className="text-center">
                            <div className={`w-24 h-24 bg-gradient-to-r ${
                              isCurrentlySelected
                                ? 'from-green-500 via-emerald-500 to-teal-600'
                                : 'from-blue-500 via-purple-500 to-indigo-600'
                            } rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                              {isCurrentlySelected ? (
                                <Check className="w-12 h-12 text-white" />
                              ) : (
                                <Layout className="w-12 h-12 text-white" />
                              )}
                            </div>
                            <h3 className="font-bold text-2xl text-slate-800 mb-4">{template.name}</h3>
                            {template.colors && (
                              <div className="flex justify-center space-x-3 mb-6">
                                {template.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-6 h-6 rounded-full shadow-lg ring-2 ring-white transform group-hover:scale-110 transition-transform duration-300"
                                    style={{ backgroundColor: color, transitionDelay: `${index * 50}ms` }}
                                  ></div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="absolute top-6 right-6 flex flex-col space-y-2">
                          {isCurrentlySelected && (
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-xl backdrop-blur-sm">
                              <Check className="w-4 h-4 mr-2" />
                              Currently Active
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-6 left-6 flex space-x-2">
                          <button
                            onClick={() => handlePreview(template)}
                            className="bg-white/90 backdrop-blur-sm text-slate-700 p-3 rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                            title="Preview Template"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Quality Badge */}
                        <div className="absolute bottom-6 left-6">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-xl">
                            <Award className="w-4 h-4 mr-2" />
                            Premium Quality
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="lg:w-1/2 p-8 lg:p-12">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-3xl font-bold text-slate-800 mb-3">{template.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                            <span className="bg-slate-100 px-3 py-1 rounded-full font-medium">
                              {template.category || 'Template'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                        {template.description}
                      </p>

                      {/* Enhanced Sections */}
                      {template.sections && template.sections.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <Layers className="w-5 h-5 mr-2 text-blue-600" />
                            Template Sections
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {template.sections.slice(0, 4).map((section, index) => (
                              <div key={index} className="flex items-center text-slate-700 bg-slate-50 px-4 py-2 rounded-xl">
                                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                <span className="font-medium">{section}</span>
                              </div>
                            ))}
                            {template.sections.length > 4 && (
                              <div className="text-slate-500 italic px-4 py-2">
                                +{template.sections.length - 4} more sections included
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Features */}
                      {template.features && template.features.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                            Key Features
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {template.features.slice(0, 4).map((feature, index) => (
                              <div key={index} className="flex items-center text-slate-700">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Tags */}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                          {template.tags.slice(0, 4).map((tag, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl font-semibold border border-blue-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Enhanced Action Buttons */}
                      <div className="flex space-x-4">
                        {isCurrentlySelected ? (
                          <button
                            disabled
                            className="flex-1 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-xl cursor-default"
                          >
                            <div className="flex items-center justify-center">
                              <Check className="w-6 h-6 mr-3" />
                              Currently Selected
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTemplateSelect(template)}
                            disabled={savingTemplate && isSelected}
                            className={`flex-1 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl'
                                : 'bg-white/60 backdrop-blur-sm border-2 border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {savingTemplate && isSelected ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                                Saving...
                              </div>
                            ) : isSelected ? (
                              <div className="flex items-center justify-center">
                                <Check className="w-6 h-6 mr-3" />
                                Selected
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <Rocket className="w-6 h-6 mr-3" />
                                Select Template
                              </div>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handlePreview(template)}
                          className="px-8 py-4 bg-white/60 backdrop-blur-sm border-2 border-slate-300 text-slate-700 rounded-2xl hover:bg-white hover:border-slate-400 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Eye className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Selection Status */}
                      {isSelected && !isCurrentlySelected && (
                        <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl">
                          <p className="text-blue-800 font-medium flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            {isSaved
                              ? 'This template is selected and saved to your profile.'
                              : 'Selection in progress...'
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
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl max-w-md mx-auto">
                <Layout className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-600 mb-4">No templates found</h3>
                <p className="text-slate-500 leading-relaxed">Try adjusting your filters to discover more amazing templates.</p>
              </div>
            </div>
          )}

          {/* Selected Template Confirmation */}
          {selectedTemplate && userSelectedTemplate && (
            <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 text-white rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold mb-3 flex items-center">
                    <Sparkles className="w-8 h-8 mr-3" />
                    Ready to Build Your Portfolio!
                  </h3>
                  <p className="text-green-100 text-lg leading-relaxed">
                    Your "<span className="font-semibold">{templates.find(t => (t.templateId || t.id) === selectedTemplate)?.name}</span>" template is ready.
                    Let's create your professional portfolio and make it live!
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Rocket className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="text-center mb-12">
            <button
              onClick={handleContinue}
              disabled={!selectedTemplate || !userSelectedTemplate}
              className="group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-5 rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-bold text-xl shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto transform hover:scale-105"
            >
              {!selectedTemplate || !userSelectedTemplate ? (
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 mr-3" />
                  Select a Template to Continue
                </div>
              ) : (
                <div className="flex items-center">
                  <Rocket className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                  Build My Portfolio
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Footer Section */}
        <Footer/>
      </div>
    </>
  );
};

export default TemplateSelection;