const emailService = require('../utils/emailService');

// @desc    Submit feedback and send email
// @route   POST /api/feedback
// @access  Public
const submitFeedback = async (req, res) => {
  try {
    const { name, email, subject, message, type, rating } = req.body;

    // Get user info
    const userAgent = req.get('User-Agent') || '';
    const timestamp = new Date();

    // Prepare email data
    const emailData = {
      name,
      email,
      subject,
      message,
      type: type || 'general',
      rating,
      userAgent,
      timestamp
    };

    // Send email notifications
    try {
      // Send notification to admin
      const adminEmailResult = await emailService.sendFeedbackNotification(emailData);
      
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! We\'ll get back to you soon.',
      data: {
        submittedAt: timestamp,
        name,
        email,
        subject,
        type: type || 'general'
      }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.',
      error: error.message
    });
  }
};


// @desc    Test email functionality
// @route   POST /api/feedback/test-email
// @access  Private (User and Admin)
const testEmail = async (req, res) => {
  try {
    const testResult = await emailService.testConnection();
    
    if (testResult) {
      res.json({
        success: true,
        message: 'Email service is working correctly'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email service test failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
};

module.exports = {
  submitFeedback,
  testEmail
};

