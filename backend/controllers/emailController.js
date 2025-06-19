const User = require('../models/User');
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

// @desc    Send portfolio contact email to owner
// @route   POST /api/portfolio/contact
// @access  Public
const submitContactMessage = async (req, res) => {
  try {
    const { portfolioContactData } = req.body;

    if (!portfolioContactData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format.'
      });
    }

    const { name, email, message, ownerDetail } = portfolioContactData;


    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const portfolioOwner = await User.findOne({ 
      username: ownerDetail.trim() 
    }).select('email firstName lastName username');

    if (!portfolioOwner) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio owner not found.'
      });
    }

    // Get user info
    // const userAgent = req.get('User-Agent') || '';
    // const ipAddress = req.ip || req.connection.remoteAddress || '';
    const timestamp = new Date();

    // Prepare contact data
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      ownerDetail: {
        username: portfolioOwner.username,
        email: portfolioOwner.email,
        fullName: `${portfolioOwner.firstName || ''} ${portfolioOwner.lastName || ''}`.trim()
      },
      // userAgent,
      // ipAddress,
      timestamp
    };

    try {
      // Send notification to portfolio owner
      const ownerEmailResult = await emailService.sendContactNotification(contactData)

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! I\'ll get back to you as soon as possible.',
      submittedAt: timestamp,
    });

  } catch (error) {
    console.error('Submit contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or contact me directly.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
  submitContactMessage,
  testEmail
};

