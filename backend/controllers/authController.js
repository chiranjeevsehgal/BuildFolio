const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');
const passport = require('passport');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
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

    const { firstName, lastName, email, password, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    const existingUserName = await User.findOne({ username });
    if (existingUserName) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this username'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      password
    });

    // Generate token
    // const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    //   token,
      user: {
        // id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/profile
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        selectedTemplate: user.selectedTemplate,
        username: user.username,
        isProfileCompleted: user.isProfileCompleted,
        isEmailVerified: user.isEmailVerified,
        profilePhoto: user.profilePhoto,
        title: user.title,
        bio: user.bio,
         portfolioDeployed: user.portfolioDeployed,
        portfolioUrl: user.portfolioUrl,
        deployedAt: user.deployedAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
};

// @desc    Mark profile as completed
// @route   PATCH /api/auth/profile/complete
// @access  Private
const markProfileCompleted = async (req, res) => {
    try {
        const { isProfileCompleted } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isProfileCompleted },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile completion status updated',
            user: {
                id: user._id,
                isProfileCompleted: user.isProfileCompleted
            }
        });
    } catch (error) {
        console.error('Mark profile completed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile completion status',
            error: error.message
        });
    }
};


// OAuth Success
const oauthSuccess = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  } catch (error) {
    console.error('OAuth success error:', error);
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};

// OAuth Failure
const oauthFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/auth/error`);
};

module.exports = {
  register,
  login,
  getMe,
  markProfileCompleted,
  oauthSuccess,
  oauthFailure
};
