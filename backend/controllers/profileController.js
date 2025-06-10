const Profile = require('../models/Profile');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');
const linkedinService = require('../utils/linkedin');
const PortfolioDeployment = require('../models/PortfolioDeployment');

// @desc    Get user profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', 'firstName lastName email username');
    
    if (!profile) {
      // Create empty profile if doesn't exist
      profile = new Profile({
        user: req.user.id,
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: []
      });
      await profile.save();
      await profile.populate('user', 'firstName lastName email username');
    }
    
    // Calculate completion percentage
    profile.calculateCompletion();
    await profile.save();

    const extraData = await User.findById(req.user.id).select('selectedTemplate isProfileCompleted portfolioDeployed');

    
    res.json({
      success: true,
      profile: {
        ...profile.toObject(),
        selectedTemplate: extraData?.selectedTemplate || null,
        isProfileCompleted: extraData?.isProfileCompleted || false,
        portfolioDeployed: extraData?.portfolioDeployed || false,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profiles/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      phone,
      location,
      website,
      socialLinks,
      title,
      summary,
      skills,
      experience,
      education,
      projects,
      certifications
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    // Update fields
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (website !== undefined) profile.website = website;
    if (socialLinks !== undefined) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };
    if (title !== undefined) profile.title = title;
    if (summary !== undefined) profile.summary = summary;
    if (skills !== undefined) profile.skills = skills;
    if (experience !== undefined) profile.experience = experience;
    if (education !== undefined) profile.education = education;
    if (projects !== undefined) profile.projects = projects;
    if (certifications !== undefined) profile.certifications = certifications;

    // Calculate completion percentage
    profile.calculateCompletion();
    
    await profile.save();
    await profile.populate('user', 'firstName lastName email username');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/profiles/photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'portfoliogen/profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Update profile
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    profile.profilePhoto = result.secure_url;
    profile.calculateCompletion();
    await profile.save();

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      photoUrl: result.secure_url
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: error.message
    });
  }
};

// PATCH /api/user/template - Update user's selected template
const updateUserTemplate = async (req, res) => {
  try {
    const { selectedTemplate } = req.body;
    const userId = req.user.id;

    console.log('Updating template for user:', userId);
    console.log('New template:', selectedTemplate);

    if (!selectedTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Template selection is required'
      });
    }

    // Get current user to check if template is actually changing
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isTemplateChanging = currentUser.selectedTemplate !== selectedTemplate;
    const wasDeployed = currentUser.portfolioDeployed;
    
    // Update data object
    const updateData = { selectedTemplate };
    
    // If template is changing and user had a deployed portfolio, reset deployment
    if (isTemplateChanging && wasDeployed) {
      console.log('Template changed, resetting deployment status');
      updateData.portfolioDeployed = false;
      updateData.portfolioUrl = null;
      updateData.deployedAt = null;
      
      // Also deactivate the portfolio deployment record if it exists
      try {
        await PortfolioDeployment.findOneAndUpdate(
          { userId },
          { 
            isActive: false,
            templateId: selectedTemplate, // Update to new template
            updatedAt: new Date()
          }
        );
      } catch (deploymentError) {
        console.log('No existing deployment record to update');
      }
    }

    // Update user record
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Updated user:', user);
    
    const responseMessage = isTemplateChanging && wasDeployed
      ? 'Template updated! Your portfolio needs to be redeployed with the new design.'
      : 'Template selection updated';

    res.json({
      success: true,
      message: responseMessage,
      selectedTemplate: user.selectedTemplate,
      data: {
        selectedTemplate: user.selectedTemplate,
        portfolioDeployed: user.portfolioDeployed,
        needsRedeployment: isTemplateChanging && wasDeployed
      }
    });

  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template selection',
      error: error.message
    });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  uploadProfilePhoto,
  updateUserTemplate
};
