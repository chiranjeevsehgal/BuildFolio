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
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);

    // Upload buffer directly to Cloudinary (no disk storage needed)
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'buildfolio/profiles',
        public_id: `profile_${req.user.id}_${Date.now()}`, // Unique ID for each user
        transformation: [
          { 
            width: 400, 
            height: 400, 
            crop: 'fill', 
            gravity: 'face',
            quality: 'auto',
            fetch_format: 'auto'
          }
        ],
        overwrite: true, // Allow overwriting existing files
        resource_type: 'image'
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload to cloud storage',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }

        try {
          console.log('Cloudinary upload successful:', result.public_id);

          // Find or create profile
          let profile = await Profile.findOne({ user: req.user.id });
          if (!profile) {
            profile = new Profile({ 
              user: req.user.id,
              personalInfo: {
                phone: '',
                location: '',
                socialLinks: {
                  linkedin: '',
                  github: ''
                }
              }
            });
          }

          // If user had a previous photo, optionally delete it from Cloudinary
          if (profile.profilePhoto) {
            try {
              // Extract public_id from old URL to delete old image
              const urlParts = profile.profilePhoto.split('/');
              const publicIdWithExtension = urlParts[urlParts.length - 1];
              const oldPublicId = publicIdWithExtension.split('.')[0];
              
              if (oldPublicId && oldPublicId.startsWith('profile_')) {
                await cloudinary.uploader.destroy(`buildfolio/profiles/${oldPublicId}`);
                console.log('Old profile photo deleted from Cloudinary');
              }
            } catch (deleteOldError) {
              console.warn('Failed to delete old profile photo:', deleteOldError.message);
            }
          }

          // Update profile with new photo URL
          profile.profilePhoto = result.secure_url;
          
          // Calculate completion if method exists
          if (typeof profile.calculateCompletion === 'function') {
            profile.calculateCompletion();
          }
          
          await profile.save();

          console.log('Profile updated successfully');

          // Send success response
          res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photoUrl: result.secure_url,
            publicId: result.public_id
          });

        } catch (dbError) {
          console.error('Database update error:', dbError);
          res.status(500).json({
            success: false,
            message: 'Photo uploaded but failed to update profile',
            error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          });
        }
      }
    );

    // Upload the buffer to Cloudinary
    result.end(req.file.buffer);

  } catch (error) {
    console.error('Upload photo error:', error);

    // Handle specific error types
    if (error.message.includes('Invalid image file')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image file format'
      });
    }

    if (error.message.includes('File too large')) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB allowed.'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
