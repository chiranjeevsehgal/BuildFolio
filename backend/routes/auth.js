const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const { register, login, getMe, oauthSuccess, oauthFailure, markProfileCompleted, sendOtp, verifyOtp, resendOtp, resendPasswordResetOtp, resetPassword, verifyResetOtp, forgotPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { otpSendLimiter, otpVerifyLimiter, registerLimiter } = require('../middleware/otprateLimiter');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('verifiedToken')
      .notEmpty()
      .withMessage('Email verification token is required'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const verifyResetOtpValidation = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('tempToken')
    .notEmpty()
    .withMessage('Verification token is required')
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required')
];

const resendResetOtpValidation = [
  body('tempToken')
    .notEmpty()
    .withMessage('Verification token is required')
];

// Routes -----------------------------------

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', 
  otpSendLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],
  sendOtp
);

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp',
  otpVerifyLimiter,
  [
    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be a 6-digit number'),
    body('tempToken')
      .notEmpty()
      .withMessage('Verification token is required')
  ],
  verifyOtp
);


// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp',
  otpSendLimiter,
  [
    body('tempToken')
      .notEmpty()
      .withMessage('Verification token is required')
  ],
  resendOtp
);


// @desc    Register user (after email verification)
// @route   POST /api/auth/register
// @access  Public
router.post('/register',
  registerLimiter,registerValidation, register
);

// Password reset routes
router.post('/forgot-password', 
  otpSendLimiter,
  forgotPasswordValidation,
  forgotPassword
);

router.post('/verify-reset-otp',
  otpVerifyLimiter,
  verifyResetOtpValidation,
  verifyResetOtp
);

router.post('/reset-password',
  registerLimiter,
  resetPasswordValidation,
  resetPassword
);

router.post('/resend-reset-otp',
  otpSendLimiter,
  resendResetOtpValidation,
  resendPasswordResetOtp
);


router.post('/login', loginValidation, login);
router.get('/profile', auth, getMe);
router.patch('/profile/complete', auth, markProfileCompleted);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/failure' }), auth.checkActiveUserForOAuth,
  oauthSuccess
);

// LinkedIn OAuth
router.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/auth/failure' }),
  oauthSuccess
);

// OAuth callbacks
router.get('/success', oauthSuccess);
router.get('/failure', oauthFailure);

module.exports = router;

