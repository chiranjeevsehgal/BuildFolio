// routes/templates.js - Express routes for template management
const express = require("express");
const router = express.Router();
const Template = require("../models/Template");
const { protect } = require("../middleware/auth");

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
const getTemplates = async (req, res) => {
  try {
    const { category, premium, search } = req.query;

    // Build filter object
    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (premium !== undefined) {
      filter.isPremium = premium === "true";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const templates = await Template.find(filter)
      .sort({ featured: -1, rating: -1, downloads: -1 })
      .select("-__v");

    res.json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
      error: error.message,
    });
  }
};

// @desc    Get single template by ID
// @route   GET /api/templates/:id
// @access  Public
const getTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({ templateId: req.params.id });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Increment view count
    template.views = (template.views || 0) + 1;
    await template.save();

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Get template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch template",
      error: error.message,
    });
  }
};

// @desc    Create new template
// @route   POST /api/templates
// @access  Private (Admin only)
const createTemplate = async (req, res) => {
  try {
    // const templateData = {
    //   ...req.body,
    //   createdBy: req.user.id
    // };

    // const template = await Template.create(templateData);
    const template = await Template.create(req.body);

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Create template error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Template ID already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create template",
      error: error.message,
    });
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private (Admin only)
const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { templateId: req.params.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.json({
      success: true,
      message: "Template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Update template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update template",
      error: error.message,
    });
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private (Admin only)
const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      templateId: req.params.id,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Delete template error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete template",
      error: error.message,
    });
  }
};

// @desc    Get featured templates
// @route   GET /api/templates/featured
// @access  Public
const getFeaturedTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ featured: true })
      .sort({ rating: -1 })
      .limit(6)
      .select("-__v");

    res.json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    console.error("Get featured templates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured templates",
      error: error.message,
    });
  }
};

// @desc    Increment template download count
// @route   POST /api/templates/:id/download
// @access  Private
const incrementDownload = async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { templateId: req.params.id },
      { $inc: { downloadCount: 1 } },
      { new: true },
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.json({
      success: true,
      message: "Download count updated",
      downloadCount: template.downloadCount,
    });
  } catch (error) {
    console.error("Increment download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update download count",
      error: error.message,
    });
  }
};

// Sample template data for seeding
const sampleTemplateData = {
  templateId: "modern-professional",
  name: "Modern Professional",
  description:
    "Ultra-modern design with gradient backgrounds, animated elements, and glass-morphism effects. Perfect for showcasing professional experience and technical skills with a contemporary aesthetic.",
  category: "modern",
  features: [
    "Animated Hero Section",
    "Gradient Backgrounds",
    "Glass-morphism Effects",
    "Interactive Skill Bars",
    "Timeline Experience Layout",
  ],
  sections: [
    "Hero with Contact Info",
    "Skills & Expertise",
    "Professional Experience",
    "Featured Projects",
    "Education",
    "Certifications",
    "Statistics",
    "Contact Footer",
  ],
  isPremium: false,
  featured: true,
  colors: ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"],
  tags: [
    "modern",
    "professional",
    "animated",
    "glass-morphism",
    "gradient",
    "responsive",
    "portfolio",
    "resume",
    "cv",
  ],
};

// Sample template data for seeding
const seedTemplates = async () => {
  try {
    // Clear existing templates
    await Template.deleteMany({});

    // Sample templates data
    const templates = [
      {
        ...sampleTemplateData,
        templateId: "modern-professional",
        name: "Modern Professional",
      },
      {
        ...sampleTemplateData,
        templateId: "minimal-clean",
        name: "Minimal Clean",
        category: "minimal",
        description:
          "Clean and minimal design focusing on typography and white space. Perfect for professionals who prefer understated elegance.",
        colors: ["#000000", "#ffffff", "#6b7280"],
        tags: ["minimal", "clean", "typography", "professional"],
        rating: 4.7,
        downloadCount: 8932,
        downloads: "8.9k",
      },
      {
        ...sampleTemplateData,
        templateId: "creative-portfolio",
        name: "Creative Portfolio",
        category: "creative",
        description:
          "Bold and vibrant design with creative layouts and animations. Ideal for designers, artists, and creative professionals.",
        colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"],
        tags: ["creative", "portfolio", "colorful", "artistic"],
        isPremium: true,
        rating: 4.8,
        downloadCount: 6234,
        downloads: "6.2k",
      },
      {
        ...sampleTemplateData,
        templateId: "developer-focused",
        name: "Developer Focused",
        category: "developer",
        description:
          "Technical design highlighting code projects, GitHub integration, and developer-specific sections.",
        colors: ["#0d1117", "#21262d", "#30363d", "#58a6ff"],
        tags: ["developer", "github", "code", "technical"],
        rating: 4.9,
        downloadCount: 15678,
        downloads: "15.7k",
      },
      {
        ...sampleTemplateData,
        templateId: "executive-suite",
        name: "Executive Suite",
        category: "executive",
        description:
          "Sophisticated design for executives and business leaders with focus on achievements and leadership.",
        colors: ["#1f2937", "#374151", "#6b7280", "#d1d5db"],
        tags: ["executive", "business", "leadership", "corporate"],
        isPremium: true,
        rating: 4.6,
        downloadCount: 4521,
        downloads: "4.5k",
      },
    ];

    await Template.insertMany(templates);
  } catch (error) {
    console.error("Seeding error:", error);
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getFeaturedTemplates,
  incrementDownload,
  seedTemplates,
};
