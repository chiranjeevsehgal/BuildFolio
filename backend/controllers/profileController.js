const Profile = require('../models/Profile');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');
const linkedinService = require('../utils/linkedin');

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
    
    res.json({
      success: true,
      profile
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

// @desc    Import LinkedIn profile
// @route   POST /api/profiles/linkedin-import
// @access  Private
const importLinkedInProfile = async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'LinkedIn access token is required'
      });
    }

    // Get LinkedIn profile data
    const linkedinData = await linkedinService.getProfile(accessToken);
    
    if (!linkedinData) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch LinkedIn profile'
      });
    }

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    // Map LinkedIn data to profile
    if (linkedinData.firstName && linkedinData.lastName) {
      await User.findByIdAndUpdate(req.user.id, {
        firstName: linkedinData.firstName,
        lastName: linkedinData.lastName
      });
    }

    if (linkedinData.headline) profile.title = linkedinData.headline;
    if (linkedinData.summary) profile.summary = linkedinData.summary;
    if (linkedinData.location) profile.location = linkedinData.location;
    if (linkedinData.profilePicture) profile.profilePhoto = linkedinData.profilePicture;
    
    // Import skills
    if (linkedinData.skills && linkedinData.skills.length > 0) {
      profile.skills = [...new Set([...profile.skills, ...linkedinData.skills])];
    }

    // Import experience
    if (linkedinData.experience && linkedinData.experience.length > 0) {
      profile.experience = linkedinData.experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        location: exp.location,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        current: exp.current || false,
        description: exp.description
      }));
    }

    // Import education
    if (linkedinData.education && linkedinData.education.length > 0) {
      profile.education = linkedinData.education.map(edu => ({
        degree: edu.degree,
        school: edu.school,
        location: edu.location,
        startDate: new Date(edu.startDate),
        endDate: edu.endDate ? new Date(edu.endDate) : null,
        description: edu.description
      }));
    }

    // Set LinkedIn import data
    profile.linkedinData = {
      imported: true,
      importDate: new Date(),
      profileId: linkedinData.id
    };

    // Set social links
    if (!profile.socialLinks) profile.socialLinks = {};
    profile.socialLinks.linkedin = linkedinData.publicProfileUrl;

    // Calculate completion percentage
    profile.calculateCompletion();
    
    await profile.save();
    await profile.populate('user', 'firstName lastName email username');

    res.json({
      success: true,
      message: 'LinkedIn profile imported successfully',
      profile
    });
  } catch (error) {
    console.error('LinkedIn import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import LinkedIn profile',
      error: error.message
    });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  uploadProfilePhoto,
  importLinkedInProfile
};
