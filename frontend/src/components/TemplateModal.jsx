import React, { useEffect } from 'react';
import { 
  X, Eye, Check, Star, Layers, Sparkles, ExternalLink, Code, 
  Palette, Layout, Monitor, Smartphone, Tablet, Award, Rocket,
  Calendar, Users, Zap, Heart, Crown, ChevronRight
} from 'lucide-react';

const TemplateModal = ({ 
  template, 
  isOpen, 
  onClose, 
  onSelect, 
  onPreview, 
  isSelected, 
  isCurrentlySelected, 
  savingTemplate 
}) => {
  if (!isOpen || !template) return null;

  const templateId = template.templateId || template.id;

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      // Ensure styles are cleared on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-3 sm:p-4 lg:p-6 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-start sm:items-center justify-between space-x-3">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${
                isCurrentlySelected
                  ? 'from-green-500 via-emerald-500 to-teal-600'
                  : 'from-blue-500 via-purple-500 to-indigo-600'
              } rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                {isCurrentlySelected ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                ) : (
                  <Layout className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{template.name}</h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                  <span className="bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-gray-600">
                    {template.category || 'Template'}
                  </span>
                  {template.featured && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center">
                      <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                      <span className="hidden sm:inline">Featured</span>
                      <span className="sm:hidden">★</span>
                    </span>
                  )}
                  {isCurrentlySelected && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center">
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                      <span className="hidden sm:inline">Currently Active</span>
                      <span className="sm:hidden">Active</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 cursor-pointer hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Template Preview */}
          <div className="mb-6 sm:mb-8">
            <div className="aspect-video bg-gradient-to-br from-slate-100 via-slate-50 to-white rounded-xl sm:rounded-2xl overflow-hidden relative border border-gray-200">
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 lg:p-12">
                <div className="text-center">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-gradient-to-r ${
                    isCurrentlySelected
                      ? 'from-green-500 via-emerald-500 to-teal-600'
                      : 'from-blue-500 via-purple-500 to-indigo-600'
                  } rounded-2xl sm:rounded-3xl mx-auto mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center shadow-2xl`}>
                    {isCurrentlySelected ? (
                      <Check className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white" />
                    ) : (
                      <Layout className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-slate-800 mb-2 sm:mb-4">{template.name}</h3>
                  {template.colors && (
                    <div className="flex justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-6">
                      {template.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 rounded-full shadow-lg ring-1 sm:ring-2 ring-white"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Button Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={() => onPreview(template)}
                  className="bg-white cursor-pointer text-gray-800 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm sm:text-base"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Live Preview</span>
                  <span className="sm:hidden">Preview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Template Description */}
          {template.description && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">About This Template</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base lg:text-lg">{template.description}</p>
            </div>
          )}

          {/* Template Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Template Sections */}
            {template.sections && template.sections.length > 0 && (
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Template Sections
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  {template.sections.map((section, index) => (
                    <div key={index} className="flex items-center text-gray-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features */}
            {template.features && template.features.length > 0 && (
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                  Key Features
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-start text-gray-700">
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Template Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Template Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-lg sm:rounded-xl font-semibold border border-blue-200 text-xs sm:text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template Stats */}
          {(template.downloads || template.rating || template.lastUpdated) && (
            <div className="mb-6 sm:mb-8">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Template Statistics</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {template.downloads && (
                  <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 mb-1">{template.downloads}</div>
                    <div className="text-blue-700 text-xs sm:text-sm font-medium">Downloads</div>
                  </div>
                )}
                {template.rating && (
                  <div className="bg-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600 mb-1 flex items-center justify-center">
                      {template.rating}
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </div>
                    <div className="text-yellow-700 text-xs sm:text-sm font-medium">Rating</div>
                  </div>
                )}
                {template.views && (
                  <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-1">{template.views}</div>
                    <div className="text-green-700 text-xs sm:text-sm font-medium">Views</div>
                  </div>
                )}
                {template.lastUpdated && (
                  <div className="bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 mb-1">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mx-auto" />
                    </div>
                    <div className="text-purple-700 text-xs sm:text-sm font-medium">Updated</div>
                    <div className="text-purple-600 text-xs">{template.lastUpdated}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Responsive Preview */}
          {template.responsive && (
            <div className="mb-6 sm:mb-8">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                Responsive Design
              </h4>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center space-x-2 text-green-700">
                  <Monitor className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="font-medium text-sm sm:text-base">Desktop</span>
                </div>
                <div className="flex items-center space-x-2 text-green-700">
                  <Tablet className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="font-medium text-sm sm:text-base">Tablet</span>
                </div>
                <div className="flex items-center space-x-2 text-green-700">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="font-medium text-sm sm:text-base">Mobile</span>
                </div>
                <div className="text-green-600 text-xs sm:text-sm">
                  ✨ Optimized for all devices
                </div>
              </div>
            </div>
          )}

          {/* Template Creator/Author */}
          {template.author && (
            <div className="mb-6 sm:mb-8">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Template Creator</h4>
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm sm:text-base lg:text-lg">{template.author[0]}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{template.author}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">Template Designer</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-3 sm:p-4 lg:p-6 rounded-b-2xl sm:rounded-b-3xl">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {isCurrentlySelected ? (
              <button
                disabled
                className="flex-1 py-3 sm:py-4 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-xl cursor-default"
              >
                <div className="flex items-center justify-center">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                  <span className="hidden sm:inline">Currently Selected</span>
                  <span className="sm:hidden">Selected</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => onSelect(template)}
                disabled={savingTemplate && isSelected}
                className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl hover:from-blue-700 hover:to-indigo-800'
                }`}
              >
                {savingTemplate && isSelected ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 border-2 border-white border-t-transparent mr-2 sm:mr-3"></div>
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Saving...</span>
                  </div>
                ) : isSelected ? (
                  <div className="flex items-center justify-center">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                    <span className="hidden sm:inline">Selected</span>
                    <span className="sm:hidden">Selected</span>
                  </div>
                ) : (
                  <div className="cursor-pointer flex items-center justify-center">
                    <Rocket className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                    <span className="hidden sm:inline">Select This Template</span>
                    <span className="sm:hidden">Select</span>
                  </div>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 cursor-pointer bg-gray-100 text-gray-700 rounded-xl sm:rounded-2xl hover:bg-gray-200 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;