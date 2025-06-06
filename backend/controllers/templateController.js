// GET /api/templates - Get all templates
const getAllTemplates = async (req, res) => {
  try {
    const { category, premium } = req.query;
    
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (premium !== undefined) {
      filter.isPremium = premium === 'true';
    }
    
    const templates = await Template.find(filter).sort({ downloads: -1 });
    
    res.json({
      success: true,
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        features: template.features,
        preview: template.preview,
        isPremium: template.isPremium,
        rating: template.rating,
        downloads: template.downloads,
        colors: template.colors,
        tags: template.tags
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

// GET /api/templates/:templateId - Get template metadata
const getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    // In a real implementation, fetch from database
    const template = await Template.findOne({ id: templateId });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        features: template.features,
        sections: template.sections,
        isPremium: template.isPremium,
        rating: template.rating,
        downloads: template.downloads,
        colors: template.colors,
        tags: template.tags,
        componentPath: template.componentPath
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error.message
    });
  }
};



module.exports = {
  getAllTemplates,
  getTemplate
};
