const { MailtrapClient } = require('mailtrap');

// Initialize Mailtrap client
const client = new MailtrapClient({
  token: process.env.MAILTRAP_API_TOKEN
});

// Send feedback notification to admind
const sendFeedbackNotification = async (feedbackData) => {
  try {
    const { name, email, subject, message, type, rating, userAgent, timestamp } = feedbackData;

    // Prepare template variables
    const templateVariables = {
      user_name: name,
      user_email: email,
      timestamp: new Date(timestamp).toLocaleString(),
      subject: subject,
      type: type,
      message: message,
      rating: rating || 'Not provided',
      userAgent: userAgent
    };

    // Send email using template
    const response = await client.send({
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME
      },
      to: [
        {
          email: process.env.ADMIN_EMAIL
        }
      ],
      template_uuid: process.env.FEEDBACK_ADMIN_TEMPLATE_ID,
      template_variables: templateVariables
    });

    return { 
      success: true, 
      messageId: response.message_ids?.[0],
      details: response
    };

  } catch (error) {
    console.error('Failed to send feedback email:', error);
    throw error;
  }
};

// Send welcome/onboarding email to new users
const sendWelcomeEmail = async (userData) => {
  try {
    const { firstName, lastName, email, username } = userData;

    // Prepare template variables
    const templateVariables = {
      user_name: firstName || username || 'New User',
      getting_started_url: `${process.env.CLIENT_URL}/profile`,
      templates_url: `${process.env.CLIENT_URL}/templates`,
      support_email: process.env.ADMIN_EMAIL
    };

    // Send welcome email using template
    const response = await client.send({
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME
      },
      to: [
        {
          email: email
        }
      ],
      template_uuid: process.env.WELCOME_EMAIL_TEMPLATE_ID,
      template_variables: templateVariables
    });

    console.log('Welcome email sent successfully:', response);
    return { 
      success: true, 
      messageId: response.message_ids?.[0],
      details: response
    };

  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};


// Send OTP while registering to new users
const sendRegisterOTP = async (email, otp) => {
  try {
    // Prepare template variables
    const templateVariables = {
      email:email,
      otp: otp,
      expiry_minutes: `10`,
    };

    // Send welcome email using template
    const response = await client.send({
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME
      },
      to: [
        {
          email
        }
      ],
      template_uuid: process.env.REGISTER_OTP_TEMPLATE_ID,
      template_variables: templateVariables
    });

    console.log('Registration otp sent successfully:', response);
    return { 
      success: true, 
      messageId: response.message_ids?.[0],
      details: response
    };

  } catch (error) {
    console.error('Failed to send registeration email:', error);
    throw error;
  }
};


// Test connection to Mailtrap
const testConnection = async () => {
  try {
    // Send a simple test email
    const response = await client.send({
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME
      },
      to: [
        {
          email: process.env.ADMIN_EMAIL
        }
      ],
      subject: 'Mailtrap Connection Test',
      text: 'This is a test email to verify Mailtrap connection.',
      html: '<p>This is a test email to verify Mailtrap connection.</p>'
    });

    console.log('✅ Mailtrap connection successful:', response);
    return true;
  } catch (error) {
    console.error('❌ Mailtrap connection failed:', error);
    return false;
  }
};

module.exports = {
  sendFeedbackNotification,
  sendWelcomeEmail,
  sendRegisterOTP,
  testConnection
};