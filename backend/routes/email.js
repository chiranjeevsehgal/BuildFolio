const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  testEmail,
  greetOnOnboarding
} = require('../controllers/emailController');
const auth = require('../middleware/auth');


// Feedback to admin
router.post('/feedback', auth, submitFeedback);

// Test routes
router.post('/test-email', auth, testEmail);

module.exports = router;
