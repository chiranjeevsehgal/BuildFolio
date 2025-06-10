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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${
                isCurrentlySelected
                  ? 'from-green-500 via-emerald-500 to-teal-600'
                  : 'from-blue-500 via-purple-500 to-indigo-600'
              } rounded-2xl flex items-center justify-center shadow-lg`}>
                {isCurrentlySelected ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <Layout className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                    {template.category || 'Template'}
                  </span>
                  {template.featured && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                  {isCurrentlySelected && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      Currently Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Template Preview */}
          <div className="mb-8">
            <div className="aspect-video bg-gradient-to-br from-slate-100 via-slate-50 to-white rounded-2xl overflow-hidden relative border border-gray-200">
              <div className="w-full h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <div className={`w-24 h-24 bg-gradient-to-r ${
                    isCurrentlySelected
                      ? 'from-green-500 via-emerald-500 to-teal-600'
                      : 'from-blue-500 via-purple-500 to-indigo-600'
                  } rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl`}>
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
                          className="w-8 h-8 rounded-full shadow-lg ring-2 ring-white"
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
                  className="bg-white cursor-pointer text-gray-800 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  <Eye className="w-5 h-5" />
                  <span>Live Preview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Template Description */}
          {template.description && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About This Template</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{template.description}</p>
            </div>
          )}

          {/* Template Details Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Template Sections */}
            {template.sections && template.sections.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-blue-600" />
                  Template Sections
                </h4>
                <div className="space-y-2">
                  {template.sections.map((section, index) => (
                    <div key={index} className="flex items-center text-gray-700 px-4 py-2 rounded-xl">
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="font-medium">{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Features */}
            {template.features && template.features.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  Key Features
                </h4>
                <div className="space-y-2">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-start text-gray-700">
                      <ChevronRight className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Template Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Template Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl font-semibold border border-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template Stats */}
          {(template.downloads || template.rating || template.lastUpdated) && (
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Template Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {template.downloads && (
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{template.downloads}</div>
                    <div className="text-blue-700 text-sm font-medium">Downloads</div>
                  </div>
                )}
                {template.rating && (
                  <div className="bg-yellow-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-1 flex items-center justify-center">
                      {template.rating}
                      <Star className="w-4 h-4 ml-1" />
                    </div>
                    <div className="text-yellow-700 text-sm font-medium">Rating</div>
                  </div>
                )}
                {template.views && (
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{template.views}</div>
                    <div className="text-green-700 text-sm font-medium">Views</div>
                  </div>
                )}
                {template.lastUpdated && (
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      <Calendar className="w-6 h-6 mx-auto" />
                    </div>
                    <div className="text-purple-700 text-sm font-medium">Updated</div>
                    <div className="text-purple-600 text-xs">{template.lastUpdated}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Responsive Preview */}
          {template.responsive && (
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-green-600" />
                Responsive Design
              </h4>
              <div className="flex items-center space-x-6 bg-green-50 rounded-2xl p-6">
                <div className="flex items-center space-x-2 text-green-700">
                  <Monitor className="w-6 h-6" />
                  <span className="font-medium">Desktop</span>
                </div>
                <div className="flex items-center space-x-2 text-green-700">
                  <Tablet className="w-6 h-6" />
                  <span className="font-medium">Tablet</span>
                </div>
                <div className="flex items-center space-x-2 text-green-700">
                  <Smartphone className="w-6 h-6" />
                  <span className="font-medium">Mobile</span>
                </div>
                <div className="text-green-600 text-sm">
                  ✨ Optimized for all devices
                </div>
              </div>
            </div>
          )}

          {/* Template Creator/Author */}
          {template.author && (
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Template Creator</h4>
              <div className="bg-gray-50 rounded-2xl p-6 flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{template.author[0]}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{template.author}</div>
                  <div className="text-gray-600 text-sm">Template Designer</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-6 rounded-b-3xl">
          <div className="flex space-x-4">
            {isCurrentlySelected ? (
              <button
                disabled
                className="flex-1 py-4 px-8 rounded-2xl font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-xl cursor-default"
              >
                <div className="flex items-center justify-center">
                  <Check className="w-6 h-6 mr-3" />
                  Currently Selected
                </div>
              </button>
            ) : (
              <button
                onClick={() => onSelect(template)}
                disabled={savingTemplate && isSelected}
                className={`flex-1 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl hover:from-blue-700 hover:to-indigo-800'
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
                  <div className="cursor-pointer flex items-center justify-center">
                    <Rocket className="w-6 h-6 mr-3" />
                    Select This Template
                  </div>
                )}
              </button>
            )}

            {/* <button
              onClick={() => onPreview(template)}
              className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Eye className="w-6 h-6" />
            </button> */}

            <button
              onClick={onClose}
              className="px-8 py-4 cursor-pointer bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-bold text-lg"
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