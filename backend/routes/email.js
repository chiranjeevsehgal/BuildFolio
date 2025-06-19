const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  testEmail,
  greetOnOnboarding,
  submitContactMessage
} = require('../controllers/emailController');
const auth = require('../middleware/auth');


// Feedback to admin
router.post('/feedback', auth, submitFeedback);


// @desc    Send portfolio contact email to owner
// @route   POST /api/email/contact
// @access  Public
router.post('/contact', submitContactMessage);

// Test routes
router.post('/test-email', auth, testEmail);

module.exports = router;
