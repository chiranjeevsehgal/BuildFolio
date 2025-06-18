const User = require('../models/User');
const Profile = require('../models/Profile');
const PortfolioDeployment = require('../models/PortfolioDeployment');
const { validationResult } = require('express-validator');

// @desc    Deploy user's portfolio
// @route   POST /api/portfolio/deploy
// @access  Private
const deployPortfolio = async (req, res) => {
  try {
    const { templateId, username, customDomain } = req.body;
    const userId = req.user._id;

    console.log('Deploying portfolio for user:', userId);
    console.log('Template ID:', templateId);
    console.log('Username:', username);
    
    
    // Validate required fields
    if (!templateId || !username) {
      return res.status(400).json({
        success: false,
        message: 'Template ID and username are required'
      });
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9._-]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'
      });
    }

    // Check if username is available
    const existingUser = await User.findOne({ 
      username: username.toLowerCase(), 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Check if username is in existing deployments
    const existingDeployment = await PortfolioDeployment.findOne({
      username: username.toLowerCase(),
      userId: { $ne: userId }
    });

    if (existingDeployment) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Get user and profile data
    const user = await User.findById(userId);
    const profile = await Profile.findOne({ user:userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete your profile first.'
      });
    }

    // Check if profile is completed
    if (!user.isProfileCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before deploying portfolio'
      });
    }

    // Generate portfolio URL
    const portfolioUrl = customDomain || `${process.env.CLIENT_URL}/portfolio/${username.toLowerCase()}`;

    // Update user with deployment info
    await User.findByIdAndUpdate(userId, {
      username: username.toLowerCase(),
      selectedTemplate: templateId,
      portfolioDeployed: true,
      portfolioUrl: portfolioUrl,
      deployedAt: new Date()
    });

    // Prepare user data for deployment
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      profilePhoto: user.profilePhoto || profile.profilePhoto,
      personalInfo: {
        phone: profile.phone,
        location: profile.location,
        website: profile.website,
        socialLinks: profile.socialLinks || {}
      },
      professional: {
        title: profile.title,
        summary: profile.summary,
        skills: profile.skills || []
      },
      experience: profile.experience || [],
      education: profile.education || [],
      projects: profile.projects || [],
      certifications: profile.certifications || []
    };

    // Create or update portfolio deployment record
    const deployment = await PortfolioDeployment.findOneAndUpdate(
      { userId },
      {
        userId,
        username: username.toLowerCase(),
        templateId,
        customDomain,
        isActive: true,
        isPublic: true,
        status: 'active',
        deployedAt: new Date(),
        userData: userData,
        seoData: {
          title: `${user.firstName} ${user.lastName} - Portfolio`,
          description: profile.summary || `Professional portfolio of ${user.firstName} ${user.lastName}`,
          keywords: (profile.skills || []).join(', ')
        }
      },
      { upsert: true, new: true }
    );

    console.log('Portfolio deployed successfully:', deployment._id);

    res.status(201).json({
      success: true,
      message: 'Portfolio deployed successfully',
      portfolioUrl: portfolioUrl,
      data: {
        username: username.toLowerCase(),
        templateId: templateId,
        deploymentId: deployment._id,
        deployedAt: deployment.deployedAt
      }
    });

  } catch (error) {
    console.error('Deploy portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy portfolio',
      error: error.message
    });
  }
};

// @desc    Unpublish user's portfolio (make it inactive and private)
// @route   PATCH /api/portfolio/unpublish
// @access  Private
const unpublishPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Unpublishing portfolio for user:', userId);

    // Find existing deployment
    const deployment = await PortfolioDeployment.findOne({ userId });

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'No portfolio deployment found'
      });
    }

    // Check if portfolio is already unpublished
    if (!deployment.isActive && !deployment.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio is already unpublished'
      });
    }

    // Update deployment to unpublished state
    deployment.isActive = false;
    // deployment.isPublic = false;
    deployment.status = 'inactive',
    deployment.unpublishedAt = new Date();
    deployment.updatedAt = new Date();
    await deployment.save();

    // Update user record
    await User.findByIdAndUpdate(userId, {
      portfolioDeployed: false
    });

    console.log('Portfolio unpublished successfully');

    res.json({
      success: true,
      message: 'Portfolio unpublished successfully',
      data: {
        username: deployment.username,
        isActive: deployment.isActive,
        isPublic: deployment.isPublic,
        unpublishedAt: deployment.unpublishedAt,
        updatedAt: deployment.updatedAt
      }
    });

  } catch (error) {
    console.error('Unpublish portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unpublish portfolio',
      error: error.message
    });
  }
};


// @desc    Redeploy/update user's portfolio
// @route   POST /api/portfolio/redeploy
// @access  Private
const redeployPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.body; // Optional: change template during redeploy

    console.log('Redeploying portfolio for user:', userId);

    // Get existing deployment
    const existingDeployment = await PortfolioDeployment.findOne({ userId });
    
    if (!existingDeployment) {
      return res.status(404).json({
        success: false,
        message: 'No existing portfolio deployment found'
      });
    }

    // Get fresh user and profile data
    const user = await User.findById(userId);
    const profile = await Profile.findOne({ userId });

    if (!user || !profile) {
      return res.status(404).json({
        success: false,
        message: 'User or profile not found'
      });
    }

    // Prepare updated user data
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      profilePhoto: user.profilePhoto || profile.profilePhoto,
      personalInfo: {
        phone: profile.phone,
        location: profile.location,
        website: profile.website,
        socialLinks: profile.socialLinks || {}
      },
      professional: {
        title: profile.title,
        summary: profile.summary,
        skills: profile.skills || []
      },
      experience: profile.experience || [],
      education: profile.education || [],
      projects: profile.projects || [],
      certifications: profile.certifications || []
    };

    // Update deployment with fresh data
    const updateData = {
      userData: userData,
      updatedAt: new Date(),
      seoData: {
        title: `${user.firstName} ${user.lastName} - Portfolio`,
        description: profile.summary || `Professional portfolio of ${user.firstName} ${user.lastName}`,
        keywords: (profile.skills || []).join(', ')
      }
    };

    // Update template if provided
    if (templateId) {
      updateData.templateId = templateId;
      await User.findByIdAndUpdate(userId, { selectedTemplate: templateId });
    }

    const updatedDeployment = await PortfolioDeployment.findOneAndUpdate(
      { userId },
      updateData,
      { new: true }
    );

    console.log('Portfolio redeployed successfully:', updatedDeployment._id);

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: {
        portfolioUrl: `${process.env.FRONTEND_URL}/${updatedDeployment.username}`,
        username: updatedDeployment.username,
        templateId: updatedDeployment.templateId,
        updatedAt: updatedDeployment.updatedAt
      }
    });

  } catch (error) {
    console.error('Redeploy portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
      error: error.message
    });
  }
};

// @desc    Get public portfolio by username
// @route   GET /api/portfolio/public/:username
// @access  Public
const getPublicPortfolio = async (req, res) => {
  try {
    const { username } = req.params;

    console.log('Fetching public portfolio for username:', username);

    // Find active deployment by username
    const deployment = await PortfolioDeployment.findOne({ 
      username: username.toLowerCase(),
      isActive: true,
      isPublic: true
    });

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Increment view count
    deployment.views = (deployment.views || 0) + 1;
    deployment.lastViewedAt = new Date();
    await deployment.save();

    console.log('Portfolio found, views incremented:', deployment.views);

    res.json({
      success: true,
      data: {
        ...deployment.userData,
        selectedTemplate: deployment.templateId,
        username: deployment.username,
        seoData: deployment.seoData
      },
      meta: {
        views: deployment.views,
        deployedAt: deployment.deployedAt,
        lastUpdated: deployment.updatedAt
      }
    });

  } catch (error) {
    console.error('Get public portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load portfolio',
      error: error.message
    });
  }
};


// @desc    Get user's own portfolio info
// @route   GET /api/portfolio/me
// @access  Private
const getUserPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Fetching portfolio info for user:', userId);

    const deployment = await PortfolioDeployment.findOne({ userId });
    const user = await User.findById(userId).select('portfolioDeployed portfolioUrl selectedTemplate username');

    if (!deployment) {
      return res.json({
        success: true,
        data: {
          isDeployed: false,
          portfolioUrl: null,
          username: user?.username || null,
          selectedTemplate: user?.selectedTemplate || null
        }
      });
    }

    res.json({
      success: true,
      data: {
        isDeployed: deployment.isActive,
        portfolioUrl: `${process.env.FRONTEND_URL}/${deployment.username}`,
        username: deployment.username,
        templateId: deployment.templateId,
        isPublic: deployment.isPublic,
        views: deployment.views || 0,
        deployedAt: deployment.deployedAt,
        lastUpdated: deployment.updatedAt,
        customDomain: deployment.customDomain
      }
    });

  } catch (error) {
    console.error('Get user portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get portfolio information',
      error: error.message
    });
  }
};

// @desc    Delete user's portfolio deployment
// @route   DELETE /api/portfolio
// @access  Private
const deletePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Deleting portfolio for user:', userId);

    // Find and delete deployment
    const deployment = await PortfolioDeployment.findOneAndDelete({ userId });

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'No portfolio deployment found'
      });
    }

    // Update user record
    await User.findByIdAndUpdate(userId, {
      portfolioDeployed: false,
      portfolioUrl: null,
      deployedAt: null
    });

    console.log('Portfolio deleted successfully');

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio',
      error: error.message
    });
  }
};

// @desc    Update portfolio status (active/inactive)
// @route   PATCH /api/portfolio/status
// @access  Private
const updatePortfolioStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isActive, isPublic } = req.body;

    console.log('Updating portfolio status for user:', userId);

    const deployment = await PortfolioDeployment.findOne({ userId });

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'No portfolio deployment found'
      });
    }

    // Update status
    if (typeof isActive === 'boolean') {
      deployment.isActive = isActive;
    }
    if (typeof isPublic === 'boolean') {
      deployment.isPublic = isPublic;
    }

    deployment.updatedAt = new Date();
    await deployment.save();

    res.json({
      success: true,
      message: 'Portfolio status updated successfully',
      data: {
        isActive: deployment.isActive,
        isPublic: deployment.isPublic,
        updatedAt: deployment.updatedAt
      }
    });

  } catch (error) {
    console.error('Update portfolio status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio status',
      error: error.message
    });
  }
};

// @desc    Get portfolio analytics
// @route   GET /api/portfolio/analytics
// @access  Private
const getPortfolioAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    console.log('Fetching analytics for user:', userId);

    const deployment = await PortfolioDeployment.findOne({ userId });

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'No portfolio deployment found'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Basic analytics (you can extend this with more detailed tracking)
    const analytics = {
      totalViews: deployment.views || 0,
      deployedAt: deployment.deployedAt,
      lastUpdated: deployment.updatedAt,
      lastViewedAt: deployment.lastViewedAt,
      isActive: deployment.isActive,
      isPublic: deployment.isPublic,
      portfolioUrl: `${process.env.FRONTEND_URL}/${deployment.username}`,
      period: period
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get portfolio analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get portfolio analytics',
      error: error.message
    });
  }
};

// @desc    Check username availability
// @route   GET /api/portfolio/check-username/:username
// @access  Private
const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params;
    const userId = req.user.id;

    console.log('Checking username availability:', username);

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens',
        available: false
      });
    }

    // Check reserved usernames
    const reservedUsernames = [
      'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'root', 'support',
      'help', 'blog', 'shop', 'store', 'app', 'mobile', 'dev', 'test',
      'signin', 'signup', 'login', 'register', 'profile', 'settings',
      'dashboard', 'portfolio', 'templates', 'preview'
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
      return res.json({
        success: true,
        available: false,
        message: 'This username is reserved'
      });
    }

    // Check if username exists in users collection (excluding current user)
    const existingUser = await User.findOne({ 
      username: username.toLowerCase(), 
      _id: { $ne: userId } 
    });

    // Check if username exists in deployments (excluding current user)
    const existingDeployment = await PortfolioDeployment.findOne({
      username: username.toLowerCase(),
      userId: { $ne: userId }
    });

    const isAvailable = !existingUser && !existingDeployment;

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable ? 'Username is available' : 'Username is already taken'
    });

  } catch (error) {
    console.error('Check username availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check username availability',
      error: error.message
    });
  }
};

module.exports = {
  deployPortfolio,
  unpublishPortfolio,
  redeployPortfolio,
  getPublicPortfolio,
  getUserPortfolio,
  deletePortfolio,
  updatePortfolioStatus,
  getPortfolioAnalytics,
  checkUsernameAvailability
};
