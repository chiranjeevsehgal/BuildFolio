const Profile = require('../models/Profile');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');
const linkedinService = require('../utils/linkedin');
const PortfolioDeployment = require('../models/PortfolioDeployment');
const { default: mongoose } = require('mongoose');

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

// @desc    Get current user settings data
// @route   GET /api/profiles/settings
// @access  Private
const getSettingsData = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('firstName lastName careerStage email username industry jobSearchTimeline resumeExperience createdAt updatedAt');

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Personal data retrieved successfully',
      user: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email,
        careerStage: user.careerStage || '',
        industry: user.industry || '',
        jobSearchTimeline: user.jobSearchTimeline || '',
        resumeExperience: user.resumeExperience || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Error fetching personal data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update current user settings personal data
// @route   PUT /api/profiles/settings/personal
// @access  Private 
const updateSettingsPersonalData = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { firstName, lastName, careerStage } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only the provided fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (careerStage !== undefined) updateData.careerStage = careerStage;

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true, // Return updated document
        runValidators: true // Run mongoose validators
      }
    ).select('-password -__v');

    if (!updatedUser) {
      console.log('Failed to update user:', userId);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user personal data'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Personal information updated successfully',
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        careerStage: updatedUser.careerStage,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating personal data:', error);

    // Handle specific mongoose errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors (if any unique constraints)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate data found',
        error: 'This information already exists'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update current user settings resume data
// @route   PUT /api/profiles/settings/resume
// @access  Private
const updateSettingsResumeData = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { industry, jobSearchTimeline, resumeExperience } = req.body;
    console.log(req.body);
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only the provided fields
    const updateData = {};
    if (industry !== undefined) updateData.industry = industry;
    if (jobSearchTimeline !== undefined) updateData.jobSearchTimeline = jobSearchTimeline;
    if (resumeExperience !== undefined) updateData.resumeExperience = resumeExperience.trim();

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true, // Return updated document
        runValidators: true // Run mongoose validators
      }
    ).select('-password -__v');

    if (!updatedUser) {
      console.log('Failed to update user:', userId);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user resume data'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume information updated successfully',
      user: {
        email: updatedUser.email,
        industry: updatedUser.industry,
        jobSearchTimeline: updatedUser.jobSearchTimeline,
        resumeExperience: updatedUser.resumeExperience,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating resume data:', error);

    // Handle specific mongoose errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors (if any unique constraints)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate data found',
        error: 'This information already exists'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

const changeUsername = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const { newUsername } = req.body;

        // Check if username is already taken
        const existingUser = await User.findOne({ 
            username: newUsername.toLowerCase(),
            _id: { $ne: userId } // Exclude current user
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken. Please choose a different username.'
            });
        }

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Start a transaction to ensure data consistency
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update user username
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { 
                    username: newUsername.toLowerCase(),
                    updatedAt: new Date()
                },
                { 
                    new: true,
                    session,
                    runValidators: true
                }
            ).select('-password -__v');

            if (!updatedUser) {
                throw new Error('Failed to update username');
            }

            const deploymentUpdateResult = await PortfolioDeployment.updateMany(
                { userId: userId },
                { 
                    $set: {
                        isActive: false,
                        status: 'modified',
                        unpublishedAt: new Date(),
                        updatedAt: new Date(),
                        modifiedAt: new Date(),
                        modificationReason: 'Username changed'
                    }
                },
                { session }
            );

            // Commit the transaction
            await session.commitTransaction();

            console.log('Username changed successfully:', {
                userId,
                success:true,
                oldUsername: user.username,
                newUsername: newUsername.toLowerCase(),
                deploymentsAffected: deploymentUpdateResult.modifiedCount
            });

            // Return success response
            res.status(200).json({
                success: true,
                message: 'Username changed successfully. Portfolio deployment has been unpublished.',
                user: {
                    id: updatedUser._id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    updatedAt: updatedUser.updatedAt
                },
            });

        } catch (transactionError) {
            // Rollback transaction on error
            await session.abortTransaction();
            throw transactionError;
        } finally {
            // End session
            session.endSession();
        }

    } catch (error) {
        console.error('Error changing username:', error);
        
        // Handle specific mongoose errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken. Please choose a different username.'
            });
        }

        // Generic server error
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
  getMyProfile,
  updateProfile,
  uploadProfilePhoto,
  changeUsername,
  getSettingsData,
  updateSettingsPersonalData,
  updateSettingsResumeData,
  updateUserTemplate
};
