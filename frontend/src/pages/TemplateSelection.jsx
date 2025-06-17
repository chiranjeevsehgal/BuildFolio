import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Eye, ArrowRight, Palette, Monitor, Smartphone, Tablet, Check, Star, Zap, Heart, 
  Grid, Layout, Code, Briefcase, User, Crown, AlertCircle, Edit3, Sparkles, 
  Layers, Filter, Search, ChevronDown, ExternalLink, Clock, Award, Rocket, Info,
  LayoutGrid,
  List
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TemplateModal from '../components/TemplateModal';

// Cache utility functions
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CACHE_KEYS = {
  TEMPLATES: 'portfolio_templates',
  USER_PROFILE: 'user_profile',
  TIMESTAMP: 'cache_timestamp'
};

const getCachedData = (key) => {
  try {
    const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
    if (!timestamp || Date.now() - parseInt(timestamp) > CACHE_DURATION) {
      // Cache expired, clear all
      Object.values(CACHE_KEYS).forEach(k => localStorage.removeItem(k));
      return null;
    }
    
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
};

const setCachedData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.warn('Cache write error:', error);
  }
};

// Skeleton components for better loading UX
const TemplateCardSkeleton = ({ viewMode }) => (
  <div className={`animate-pulse ${viewMode === 'grid' 
    ? 'bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg' 
    : 'bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg flex items-center'
  }`}>
    {viewMode === 'grid' ? (
      <>
        <div className="aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-300 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          <div className="flex space-x-2 mt-4">
            <div className="h-10 bg-slate-300 rounded-xl flex-1"></div>
            <div className="h-10 w-10 bg-slate-300 rounded-xl"></div>
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="w-16 h-16 bg-slate-300 rounded-xl mr-6 flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-slate-300 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
        <div className="flex space-x-3 ml-6">
          <div className="h-12 w-12 bg-slate-300 rounded-xl"></div>
          <div className="h-12 w-12 bg-slate-300 rounded-xl"></div>
          <div className="h-12 w-24 bg-slate-300 rounded-xl"></div>
        </div>
      </>
    )}
  </div>
);

const TemplateSelection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userSelectedTemplate, setUserSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [savingTemplate, setSavingTemplate] = useState(false);
  
  // Modal state
  const [modalTemplate, setModalTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const categories = useMemo(() => [
    { id: 'all', name: 'All Templates', icon: Grid, gradient: 'from-blue-500 to-indigo-600' },
    { id: 'minimal', name: 'Minimal', icon: Layout, gradient: 'from-slate-500 to-slate-600' },
    { id: 'creative', name: 'Creative', icon: Palette, gradient: 'from-purple-500 to-pink-600' },
    { id: 'professional', name: 'Professional', icon: Briefcase, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'developer', name: 'Developer', icon: Code, gradient: 'from-orange-500 to-red-600' }
  ], []);

  // Setup axios with memoized config
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [API_BASE_URL]);

  // Auto-dismiss messages
  useEffect(() => {
    if (message.content) {
      const timer = setTimeout(() => {
        setMessage({ type: '', content: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.content]);

  // Optimized data loading with caching
  const loadTemplatesAndUserSelection = useCallback(async () => {
    try {
      setLoading(true);

      // Check cache first
      const cachedTemplates = getCachedData(CACHE_KEYS.TEMPLATES);
      const cachedProfile = getCachedData(CACHE_KEYS.USER_PROFILE);

      if (cachedTemplates && cachedProfile) {
        // Use cached data immediately
        setTemplates(cachedTemplates);
        if (cachedProfile.selectedTemplate) {
          setSelectedTemplate(cachedProfile.selectedTemplate);
          setUserSelectedTemplate(cachedProfile.selectedTemplate);
        }
        setInitialLoading(false);
        setLoading(false);
        
        // Optionally refresh in background
        setTimeout(() => refreshDataInBackground(), 100);
        return;
      }

      // Load fresh data if no cache
      await loadFreshData();

    } catch (error) {
      console.error('Failed to load data:', error);
      handleLoadError(error);
    }
  }, []);

  const loadFreshData = async () => {
    const [templatesResponse, userResponse] = await Promise.all([
      axios.get('/templates'),
      axios.get('/auth/profile').catch(err => ({ data: { success: false } }))
    ]);

    if (templatesResponse.data.success) {
      const templatesData = templatesResponse.data.data;
      setTemplates(templatesData);
      setCachedData(CACHE_KEYS.TEMPLATES, templatesData);
    } else {
      throw new Error(templatesResponse.data.message || 'Failed to load templates');
    }

    if (userResponse.data.success && userResponse.data.user) {
      const user = userResponse.data.user;
      setCachedData(CACHE_KEYS.USER_PROFILE, user);
      
      if (user.selectedTemplate) {
        setSelectedTemplate(user.selectedTemplate);
        setUserSelectedTemplate(user.selectedTemplate);
      }
    }

    setInitialLoading(false);
    setLoading(false);
  };

  const refreshDataInBackground = async () => {
    try {
      await loadFreshData();
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  };

  const handleLoadError = (error) => {
    if (error.config?.url?.includes('/auth/profile')) {
      // If profile fails, try templates only
      axios.get('/templates')
        .then(response => {
          if (response.data.success) {
            const templatesData = response.data.data;
            setTemplates(templatesData);
            setCachedData(CACHE_KEYS.TEMPLATES, templatesData);
          }
        })
        .catch(templateError => {
          console.error('Failed to load templates:', templateError);
          setMessage({
            type: 'error',
            content: 'Failed to load templates. Please refresh the page.'
          });
        })
        .finally(() => {
          setInitialLoading(false);
          setLoading(false);
        });
    } else {
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to load templates. Please try again.'
      });
      setInitialLoading(false);
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadTemplatesAndUserSelection();
  }, [loadTemplatesAndUserSelection]);

  // Memoized filtered templates
  const filteredTemplates = useMemo(() => {
    return filterCategory === 'all'
      ? templates
      : templates.filter(template => template.category === filterCategory);
  }, [templates, filterCategory]);

  // Optimized template selection with optimistic updates
  const handleTemplateSelect = useCallback(async (template) => {
    const templateId = template.templateId || template.id;

    if (selectedTemplate === templateId && userSelectedTemplate === templateId) {
      return;
    }

    // Optimistic update
    setSelectedTemplate(templateId);
    setSavingTemplate(true);

    try {
      const response = await axios.patch('/profiles/template', {
        selectedTemplate: templateId
      });

      if (response.data.success) {
        setUserSelectedTemplate(templateId);
        
        // Update cache
        const cachedProfile = getCachedData(CACHE_KEYS.USER_PROFILE) || {};
        setCachedData(CACHE_KEYS.USER_PROFILE, {
          ...cachedProfile,
          selectedTemplate: templateId
        });

        setMessage({
          type: 'success',
          content: 'Template selected and saved successfully!'
        });
        setIsModalOpen(false);
      } else {
        throw new Error(response.data.message || 'Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template selection:', error);
      setMessage({
        type: 'error',
        content: error.response?.data?.message || 'Failed to save template selection. Please try again.'
      });
      // Revert optimistic update
      setSelectedTemplate(userSelectedTemplate);
    } finally {
      setSavingTemplate(false);
    }
  }, [selectedTemplate, userSelectedTemplate]);

  const handlePreview = useCallback((template) => {
    setPreviewTemplate(template);
    const templateId = template.templateId || template.id;
    window.open(`/preview/${templateId}`, '_blank');
  }, []);

  const handleTemplateClick = useCallback((template) => {
    setModalTemplate(template);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalTemplate(null);
  }, []);

  const handleContinue = useCallback(async () => {
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
  }, [selectedTemplate, userSelectedTemplate]);

  // Show skeleton loading for initial load only
  if (initialLoading) {
    return (
      <>
        <Navbar current={"/templates"} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          {/* Hero Section Skeleton */}
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Choose Your Perfect Template
                </h1>
                <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Loading amazing templates for you...
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
            {/* Filters Skeleton */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 border border-white/40">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 w-20 bg-slate-200 rounded-xl animate-pulse"></div>
                  <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Templates Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <TemplateCardSkeleton key={i} viewMode="grid" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar current={"/templates"} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                  <Palette className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Choose Your Perfect Template
              </h1>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Select a professional template that matches your style and industry. 
                All templates are fully responsive and optimized for performance.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
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

          {/* Filters and Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 border border-white/40">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isActive = filterCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFilterCategory(category.id)}
                      className={`group cursor-pointer relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                          : 'bg-white/60 text-slate-600 hover:bg-white hover:shadow-md transform hover:scale-105'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* View Mode and Stats */}
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-white/60 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 cursor-pointer rounded-lg transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 cursor-pointer rounded-lg transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-white/80'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {userSelectedTemplate && (
                  <div className="bg-green-100/80 backdrop-blur-sm text-green-800 px-3 py-2 rounded-lg font-medium flex items-center border border-green-200/50 text-sm">
                    <Check className="w-4 h-4 mr-2" />
                    Template Selected
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Show loading indicator for background refreshes */}
          {loading && !initialLoading && (
            <div className="mb-4 text-center">
              <div className="bg-blue-100/80 text-blue-800 px-4 py-2 rounded-xl inline-flex items-center text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                Updating templates...
              </div>
            </div>
          )}

          {/* Templates Grid/List View */}
          {viewMode === 'grid' ? (
            // Grid View - 3 columns
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredTemplates.map((template) => {
                const templateId = template.templateId || template.id;
                const isSelected = selectedTemplate === templateId;
                const isSaved = userSelectedTemplate === templateId;
                const isCurrentlySelected = isSelected && isSaved;

                return (
                  <div
                    key={templateId}
                    className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                      isCurrentlySelected
                        ? 'border-green-500 ring-2 ring-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50'
                        : isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50'
                        : 'border-white/50 hover:border-slate-300/50'
                    } transform hover:scale-[1.02]`}
                    onClick={() => handleTemplateClick(template)}
                  >
                    {/* Template Preview */}
                    <div className="relative">
                      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 via-slate-50 to-white rounded-t-2xl overflow-hidden relative">
                        <div className="w-full h-full flex items-center justify-center p-8">
                          <div className="text-center">
                            <div className={`w-16 h-16 bg-gradient-to-r ${
                              isCurrentlySelected
                                ? 'from-green-500 via-emerald-500 to-teal-600'
                                : 'from-blue-500 via-purple-500 to-indigo-600'
                            } rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110`}>
                              {isCurrentlySelected ? (
                                <Check className="w-8 h-8 text-white" />
                              ) : (
                                <Layout className="w-8 h-8 text-white" />
                              )}
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 mb-2">{template.name}</h3>
                            <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-medium text-slate-600">
                              {template.category || 'Template'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isCurrentlySelected && (
                          <div className="absolute top-3 right-3">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-lg">
                              <Check className="w-3 h-3 mr-1" />
                              Active
                            </div>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="absolute top-3 left-3 flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTemplateClick(template);
                            }}
                            className="bg-white/90 cursor-pointer backdrop-blur-sm text-slate-700 p-2 rounded-lg hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                            title="View Details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-6">
                      <p className="text-slate-600 mb-4 text-sm leading-relaxed line-clamp-2">
                        {template.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {isCurrentlySelected ? (
                          <button
                            disabled
                            className="flex-1 py-2 px-4 cursor-not-allowed rounded-xl font-medium text-sm bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg"
                          >
                            <div className="flex items-center justify-center">
                              <Check className="w-4 h-4 mr-2" />
                              Selected
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTemplateSelect(template);
                            }}
                            disabled={savingTemplate && isSelected}
                            className={`flex-1 cursor-pointer py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                                : 'bg-white/60 backdrop-blur-sm border border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 shadow-sm hover:shadow-md'
                            }`}
                          >
                            {savingTemplate && isSelected ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Saving...
                              </div>
                            ) : isSelected ? (
                              <div className="flex items-center justify-center">
                                <Check className="w-4 h-4 mr-2" />
                                Selected
                              </div>
                            ) : (
                              'Select'
                            )}
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(template);
                          }}
                          className="px-4 py-2 cursor-pointer bg-white/60 backdrop-blur-sm border border-slate-300 text-slate-700 rounded-xl hover:bg-white hover:border-slate-400 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View - Compact rows
            <div className="space-y-4 mb-8">
              {filteredTemplates.map((template) => {
                const templateId = template.templateId || template.id;
                const isSelected = selectedTemplate === templateId;
                const isSaved = userSelectedTemplate === templateId;
                const isCurrentlySelected = isSelected && isSaved;

                return (
                  <div
                    key={templateId}
                    className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                      isCurrentlySelected
                        ? 'border-green-500 ring-2 ring-green-200/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50'
                        : isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50'
                        : 'border-white/50 hover:border-slate-300/50'
                    }`}
                    onClick={() => handleTemplateClick(template)}
                  >
                    <div className="flex items-center p-6">
                      {/* Template Icon */}
                      <div className={`w-16 h-16 bg-gradient-to-r ${
                        isCurrentlySelected
                          ? 'from-green-500 via-emerald-500 to-teal-600'
                          : 'from-blue-500 via-purple-500 to-indigo-600'
                      } rounded-xl flex items-center justify-center shadow-lg mr-6 flex-shrink-0`}>
                        {isCurrentlySelected ? (
                          <Check className="w-8 h-8 text-white" />
                        ) : (
                          <Layout className="w-8 h-8 text-white" />
                        )}
                      </div>

                      {/* Template Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-800">{template.name}</h3>
                          <span className="bg-slate-100 px-3 py-1 rounded-lg text-sm font-medium text-slate-600">
                            {template.category || 'Template'}
                          </span>
                          {isCurrentlySelected && (
                            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                              Currently Active
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                          {template.description}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3 ml-6 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateClick(template);
                          }}
                          className="bg-white/60 backdrop-blur-sm cursor-pointer text-slate-700 p-3 rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
                          title="View Details"
                        >
                          <Info className="w-5 h-5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(template);
                          }}
                          className="bg-white/60 backdrop-blur-sm cursor-pointer text-slate-700 p-3 rounded-xl hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
                          title="Preview Template"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {isCurrentlySelected ? (
                          <button
                            disabled
                            className="py-3 px-6 rounded-xl font-medium cursor-not-allowed bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg"
                          >
                            <div className="flex items-center">
                              <Check className="w-5 h-5 mr-2" />
                              Selected
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTemplateSelect(template);
                            }}
                            disabled={savingTemplate && isSelected}
                            className={`py-3 px-6 cursor-pointer rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                                : 'bg-white/60 backdrop-blur-sm border border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {savingTemplate && isSelected ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Saving...
                              </div>
                            ) : isSelected ? (
                              <div className="flex items-center">
                                <Check className="w-5 h-5 mr-2" />
                                Selected
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Rocket className="w-5 h-5 mr-2" />
                                Select Template
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
            <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 text-white rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center">
                    <Sparkles className="w-6 h-6 mr-3" />
                    Ready to Build Your Portfolio!
                  </h3>
                  <p className="text-green-100 leading-relaxed">
                    Your "<span className="font-semibold">{templates.find(t => (t.templateId || t.id) === selectedTemplate)?.name}</span>" template is ready.
                    Let's create your professional portfolio and make it live!
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Rocket className="w-8 h-8" />
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
              className="group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-bold text-lg shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto transform hover:scale-105"
            >
              {!selectedTemplate || !userSelectedTemplate ? (
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 mr-3" />
                  Select a Template to Continue
                </div>
              ) : (
                <div className="flex items-center cursor-pointer">
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

      {/* Template Modal */}
      <TemplateModal
        template={modalTemplate}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSelect={handleTemplateSelect}
        onPreview={handlePreview}
        isSelected={modalTemplate && (selectedTemplate === (modalTemplate.templateId || modalTemplate.id))}
        isCurrentlySelected={modalTemplate && (selectedTemplate === (modalTemplate.templateId || modalTemplate.id)) && (userSelectedTemplate === (modalTemplate.templateId || modalTemplate.id))}
        savingTemplate={savingTemplate}
      />
    </>
  );
};

export default TemplateSelection;