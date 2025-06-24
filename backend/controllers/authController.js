const User = require('../models/User');
const { sendWelcomeEmail, sendRegisterOTP, sendPasswordResetOTP } = require('../utils/emailService');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');
const passport = require('passport');
const { verifyToken, createVerifiedToken, createTempToken, updateTokenAttempts, createPasswordResetVerifiedToken, createPasswordResetTempToken, updatePasswordResetTokenAttempts } = require('../utils/tokenUtils');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otpUtils');
const NotificationService = require('../utils/notificationService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);

    if (process.env.NODE_ENV === 'development') {
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
    }
    else {
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
        });
      }
    }

    const { firstName, lastName, password, username, verifiedToken } = req.body;

    // Verify and decode token
    let decoded;
    try {
      decoded = verifyToken(verifiedToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check token type and verification status
    if (decoded.type !== 'email_verified' || !decoded.emailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Email not verified. Please verify your email first.'
      });
    }


    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: decoded.email },
        { username }
      ]
    });
    if (existingUser) {
      if (existingUser.email === decoded.email) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Username already taken.'
        });
      }
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: decoded.email,
      username,
      password,
      isEmailVerified: true,
    });

    // Generate token
    // const token = generateToken(user._id);

    // Send welcome email
    try {
      const emailData = {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      };

      // Send welcome email to user
      await sendWelcomeEmail(emailData);

      const welcomeResult = await NotificationService.sendWelcomeNotification(
        user._id,
        { firstName: user?.firstName }
      );

      if (welcomeResult.success) {
        console.log('Welcome notification sent successfully');
      } else {
        console.error('Failed to send welcome notification:', welcomeResult.message);
      }


    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }


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

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
        accountDeactivated: true
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
        isEmailVerified: user.isEmailVerified,
        selectedTemplate: user.selectedTemplate,
        isProfileCompleted: user.isProfileCompleted,
        portfolioDeployed: user.portfolioDeployed,
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
        isProfileCompleted: user.isProfileCompleted,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        profilePhoto: user.profilePhoto,
        title: user.title,
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

// @desc    Send OTP to email for verification
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);

    if (process.env.NODE_ENV === 'development') {
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
    }
    else {
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
        });
      }
    }
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate and hash OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    // Send OTP email
    const emailResult = await sendRegisterOTP(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    // Create temporary token with OTP hash
    const tempToken = createTempToken(email, otpHash);

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      tempToken,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code',
      error: error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
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

    const { otp, tempToken } = req.body;

    // Verify and decode token
    let decoded;
    try {
      decoded = verifyToken(tempToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check token type
    if (decoded.type !== 'email_verification') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Check attempts
    if (decoded.attempts >= decoded.maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.'
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(otp, decoded.otpHash);

    if (!isValidOTP) {
      // Update attempts count
      const newAttempts = decoded.attempts + 1;
      const updatedToken = updateTokenAttempts(tempToken, newAttempts);

      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${decoded.maxAttempts - newAttempts} attempts remaining.`,
        tempToken: updatedToken
      });
    }

    // OTP verified successfully - create verified token
    const verifiedToken = createVerifiedToken(decoded.email);

    res.json({
      success: true,
      message: 'Email verified successfully',
      verifiedToken,
      email: decoded.email,
      expiresIn: '30 minutes'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
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

    const { tempToken } = req.body;

    // Verify and decode token
    let decoded;
    try {
      decoded = verifyToken(tempToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check token type
    if (decoded.type !== 'email_verification') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    // Send OTP email
    const emailResult = await sendRegisterOTP(decoded.email, otp);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    // Create new temporary token with new OTP hash and reset attempts
    const newTempToken = createTempToken(decoded.email, otpHash);

    res.json({
      success: true,
      message: 'New verification code sent to your email',
      tempToken: newTempToken,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code',
      error: error.message
    });
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);

    if (process.env.NODE_ENV === 'development') {
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
    }
    else {
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
        });
      }
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate and hash OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    // Send OTP email (you'll need to create this email template)
    const emailResult = await sendPasswordResetOTP(email, otp);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again.'
      });
    }

    // Create temporary token with OTP hash for password reset
    const tempToken = createPasswordResetTempToken(email, otpHash);

    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      tempToken,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset code',
      error: error.message
    });
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOtp = async (req, res) => {
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

    const { otp, tempToken } = req.body;

    // Verify and decode token
    let decoded;
    try {
      decoded = verifyToken(tempToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check token type
    if (decoded.type !== 'password_reset') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Check attempts
    if (decoded.attempts >= decoded.maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.'
      });
    }

    // Verify user still exists
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(otp, decoded.otpHash);

    if (!isValidOTP) {
      // Update attempts count
      const newAttempts = decoded.attempts + 1;
      const updatedToken = updatePasswordResetTokenAttempts(tempToken, newAttempts);

      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${decoded.maxAttempts - newAttempts} attempts remaining.`,
        tempToken: updatedToken
      });
    }

    // OTP verified successfully - create password reset token
    const resetToken = createPasswordResetVerifiedToken(decoded.email);

    res.json({
      success: true,
      message: 'Code verified successfully',
      resetToken,
      email: decoded.email,
      expiresIn: '15 minutes'
    });

  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
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

    const { password, resetToken } = req.body;

    // Verify and decode token
    let decoded;
    try {
      decoded = verifyToken(resetToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check token type and verification status
    if (decoded.type !== 'password_reset_verified' || !decoded.otpVerified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid reset token. Please verify your email first.'
      });
    }

    // Find and update user
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = password;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// @desc    Resend password reset OTP
// @route   POST /api/auth/resend-reset-otp
// @access  Public
const resendPasswordResetOtp = async (req, res) => {
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

    const { tempToken } = req.body;

    // Verify and decode token
    let decoded;
    try {
      decoded = verifyToken(tempToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check token type
    if (decoded.type !== 'password_reset') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Verify user still exists
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    // Send OTP email
    const emailResult = await sendPasswordResetOTP(decoded.email, otp);
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    // Create new temporary token with new OTP hash and reset attempts
    const newTempToken = createPasswordResetTempToken(decoded.email, otpHash);

    res.json({
      success: true,
      message: 'New verification code sent to your email',
      tempToken: newTempToken,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Resend password reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code',
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
  oauthFailure,
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendPasswordResetOtp
};
