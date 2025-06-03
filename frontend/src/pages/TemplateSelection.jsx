import React, { useState } from 'react';
import { Eye, ArrowRight, Palette, Monitor, Smartphone, Tablet, Check, Star, Zap, Heart, Grid, Layout, Code, Briefcase, User, Crown } from 'lucide-react';

const TemplateSelection = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop', 'tablet', 'mobile'
  const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'minimal', 'creative', 'professional', 'developer'
  const [previewTemplate, setPreviewTemplate] = useState(null);

//   Mock template data for now
  const templates = [
    {
      id: 'minimal-pro',
      name: 'Minimal Professional',
      category: 'minimal',
      description: 'Clean, minimal design perfect for corporate professionals',
      features: ['Clean Typography', 'Minimal Layout', 'Fast Loading', 'Mobile Responsive'],
      preview: '/api/placeholder/400/300',
      isPremium: false,
      rating: 4.9,
      downloads: '12.5k',
      colors: ['#2563eb', '#1e40af', '#3b82f6'],
      tags: ['Corporate', 'Clean', 'Professional']
    },
    {
      id: 'creative-showcase',
      name: 'Creative Showcase',
      category: 'creative',
      description: 'Bold design for creative professionals and artists',
      features: ['Visual Focus', 'Animation Effects', 'Portfolio Gallery', 'Custom Colors'],
      preview: '/api/placeholder/400/300',
      isPremium: true,
      rating: 4.8,
      downloads: '8.2k',
      colors: ['#7c3aed', '#8b5cf6', '#a78bfa'],
      tags: ['Creative', 'Visual', 'Modern']
    },
    {
      id: 'developer-focus',
      name: 'Developer Focus',
      category: 'developer',
      description: 'Technical design highlighting code projects and skills',
      features: ['Code Syntax Highlighting', 'GitHub Integration', 'Project Showcase', 'Tech Stack Display'],
      preview: '/api/placeholder/400/300',
      isPremium: false,
      rating: 4.9,
      downloads: '15.7k',
      colors: ['#059669', '#10b981', '#34d399'],
      tags: ['Developer', 'Technical', 'GitHub']
    },
    {
      id: 'business-executive',
      name: 'Business Executive',
      category: 'professional',
      description: 'Sophisticated design for executives and business leaders',
      features: ['Executive Summary', 'Achievement Focus', 'Professional Network', 'Industry Insights'],
      preview: '/api/placeholder/400/300',
      isPremium: true,
      rating: 4.7,
      downloads: '6.3k',
      colors: ['#1f2937', '#374151', '#4b5563'],
      tags: ['Executive', 'Business', 'Leadership']
    },
    {
      id: 'modern-grid',
      name: 'Modern Grid',
      category: 'creative',
      description: 'Contemporary grid-based layout with visual impact',
      features: ['Grid Layout', 'Visual Hierarchy', 'Interactive Elements', 'Smooth Animations'],
      preview: '/api/placeholder/400/300',
      isPremium: false,
      rating: 4.6,
      downloads: '9.8k',
      colors: ['#dc2626', '#ef4444', '#f87171'],
      tags: ['Modern', 'Grid', 'Interactive']
    },
    {
      id: 'elegant-timeline',
      name: 'Elegant Timeline',
      category: 'professional',
      description: 'Timeline-based design showcasing career progression',
      features: ['Timeline Layout', 'Career Journey', 'Milestone Highlights', 'Professional Story'],
      preview: '/api/placeholder/400/300',
      isPremium: true,
      rating: 4.8,
      downloads: '7.1k',
      colors: ['#0891b2', '#06b6d4', '#22d3ee'],
      tags: ['Timeline', 'Story', 'Career']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid },
    { id: 'minimal', name: 'Minimal', icon: Layout },
    { id: 'creative', name: 'Creative', icon: Palette },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'developer', name: 'Developer', icon: Code }
  ];

  const filteredTemplates = filterCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === filterCategory);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
  };

  // Backend integration to generate preview with user data
  const handlePreview = (template) => {
    setPreviewTemplate(template);
    console.log('Preview template:', template.id);
  };

  // Backend integration to save template selection and proceed
  const handleContinue = () => {
    if (selectedTemplate) {
      console.log('Selected template:', selectedTemplate);
    }
  };

  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'desktop': return <Monitor className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

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
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
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
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-2xl overflow-hidden">
                  {/* Simulated template preview */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <Layout className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-700">{template.name}</h3>
                      <div className="flex justify-center space-x-1 mt-2">
                        {template.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
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
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-1">{template.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {template.rating}
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 text-blue-500 mr-1" />
                        {template.downloads}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  {template.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Key Features</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {template.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-slate-600">
                        <Check className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Selection Button */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTemplateSelect(template)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      selectedTemplate === template.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {selectedTemplate === template.id ? (
                      <div className="flex items-center justify-center">
                        <Check className="w-4 h-4 mr-2" />
                        Selected
                      </div>
                    ) : (
                      'Select Template'
                    )}
                  </button>
                  
                  <button
                    onClick={() => handlePreview(template)}
                    className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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