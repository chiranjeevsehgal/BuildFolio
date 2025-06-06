// TemplateSelection.jsx - Updated with real template data
import React, { useState, useEffect } from 'react';
import { Eye, ArrowRight, Palette, Monitor, Smartphone, Tablet, Check, Star, Zap, Heart, Grid, Layout, Code, Briefcase, User, Crown } from 'lucide-react';
import axios from 'axios';

const TemplateSelection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');
  const [filterCategory, setFilterCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Real template data that will be fetched from DB
  const templateData = [
    {
      id: 'modern-professional',
      name: 'Modern Professional',
      category: 'professional',
      description: 'Ultra-modern design with gradient backgrounds, animated elements, and glass-morphism effects. Perfect for showcasing professional experience and technical skills.',
      features: [
        'Animated Hero Section',
        'Gradient Backgrounds', 
        'Glass-morphism Effects',
        'Interactive Skill Bars',
        'Timeline Experience Layout',
        'Project Showcase Cards',
        'Responsive Design',
        'Print-Ready Export'
      ],
      preview: '/templates/previews/modern-professional.jpg',
      isPremium: false,
      rating: 4.9,
      downloads: '12.5k',
      colors: ['#3b82f6', '#8b5cf6', '#06b6d4'],
      tags: ['Modern', 'Professional', 'Animated', 'Glass-morphism'],
      sections: [
        'Hero with Contact Info',
        'Skills & Expertise',
        'Professional Experience',
        'Featured Projects', 
        'Education',
        'Contact Footer'
      ],
      responsive: true,
      loadTime: 'Fast',
      customizable: true,
      exportFormats: ['HTML', 'PDF'],
      technologies: ['React', 'Tailwind CSS', 'Lucide Icons'],
      demoUrl: '/preview/modern-professional',
      componentPath: 'templates/ModernTemplate'
    }
  ];

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

    loadTemplates();
  }, [API_BASE_URL]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // For now, use local data. Later this will be:
      // const response = await axios.get('/api/templates');
      // setTemplates(response.data.templates);
      
      // Simulate API call
      setTimeout(() => {
        setTemplates(templateData);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to load templates:', error);
      setLoading(false);
    }
  };

  const filteredTemplates = filterCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === filterCategory);

  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template.id);
    
    // Save selection to backend
    try {
      await axios.patch('/api/user/template', {
        selectedTemplate: template.id
      });
    } catch (error) {
      console.error('Failed to save template selection:', error);
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    // Open preview in new window/modal
    window.open(`/preview/${template.id}`, '_blank', 'width=1200,height=800');
  };

  const handleContinue = async () => {
    if (selectedTemplate) {
      try {
        // Update user's template selection and mark profile as ready for deployment
        await axios.patch('/api/user/template/confirm', {
          selectedTemplate,
          readyForDeployment: true
        });
        
        // Navigate to portfolio deployment page
        window.location.href = '/portfolio';
      } catch (error) {
        console.error('Failed to confirm template selection:', error);
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

            {/* View Mode Controls */}
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
              {['desktop', 'tablet', 'mobile'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {mode === 'desktop' && <Monitor className="w-4 h-4" />}
                  {mode === 'tablet' && <Tablet className="w-4 h-4" />}
                  {mode === 'mobile' && <Smartphone className="w-4 h-4" />}
                  <span className="capitalize font-medium">{mode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid lg:grid-cols-1 xl:grid-cols-1 gap-8 mb-12">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                selectedTemplate === template.id
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
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                          <Layout className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 mb-3">{template.name}</h3>
                        <div className="flex justify-center space-x-2 mb-4">
                          {template.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <div className="flex items-center justify-center">
                            <Monitor className="w-4 h-4 mr-1" />
                            {template.responsive ? 'Fully Responsive' : 'Desktop Only'}
                          </div>
                          <div className="flex items-center justify-center">
                            <Zap className="w-4 h-4 mr-1" />
                            {template.loadTime} Loading
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Premium Badge */}
                    {template.isPremium && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Crown className="w-4 h-4 mr-1" />
                        Premium
                      </div>
                    )}

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
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {template.rating}
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 text-blue-500 mr-1" />
                          {template.downloads} downloads
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Sections Included */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Template Sections</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {template.sections.map((section, index) => (
                        <div key={index} className="flex items-center text-sm text-slate-600">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {section}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Key Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {template.features.slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-slate-600">
                          <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {template.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleTemplateSelect(template)}
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                        selectedTemplate === template.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {selectedTemplate === template.id ? (
                        <div className="flex items-center justify-center">
                          <Check className="w-5 h-5 mr-2" />
                          Selected
                        </div>
                      ) : (
                        'Select Template'
                      )}
                    </button>
                    
                    <button
                      onClick={() => handlePreview(template)}
                      className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Technical Details */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Export Formats:</span>
                        <div className="font-medium text-slate-700">
                          {template.exportFormats.join(', ')}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Customizable:</span>
                        <div className="font-medium text-slate-700">
                          {template.customizable ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Templates Found */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Layout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No templates found</h3>
            <p className="text-slate-500">Try adjusting your filters to see more templates.</p>
          </div>
        )}

        {/* Selected Template Info */}
        {selectedTemplate && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Template Selected!</h3>
                <p className="text-blue-100">
                  You've chosen "{templates.find(t => t.id === selectedTemplate)?.name}". 
                  Ready to build your portfolio?
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
            disabled={!selectedTemplate}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            Build My Portfolio
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;