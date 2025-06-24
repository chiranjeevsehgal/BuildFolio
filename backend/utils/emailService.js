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


// Send feedback notification to admind
const sendContactNotification = async (contactData) => {
  try {
    const { name, email, message, ownerDetail, timestamp } = contactData;

    // Extract owner information
    const ownerEmail = ownerDetail.email;
    const ownerName = ownerDetail.fullName || ownerDetail.username;
    const ownerUsername = ownerDetail.username;


    // Prepare template variables
    const templateVariables = {
      sender_name: name,
      sender_email: email,
      timestamp: new Date(timestamp).toLocaleString(),
      message_content: message,
      owner_name: ownerName,
      owner_username: ownerUsername
    };

    // Send email using template
    const response = await client.send({
      from: {
        email: process.env.FROM_EMAIL,
        name: process.env.FROM_NAME
      },
      to: [
        {
          email: ownerEmail
        }
      ],
      template_uuid: process.env.PORTFOLIO_CONTACT_TEMPLATE_ID,
      template_variables: templateVariables
    });

    return { 
      success: true, 
      messageId: response.message_ids?.[0],
      details: response
    };

  } catch (error) {
    console.error('Failed to send portfolio contact email:', error);
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
    console.error('Failed to send registration email:', error);
    throw error;
  }
};

// Send OTP while resetting password to users
const sendPasswordResetOTP = async (email, otp) => {
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

    console.log('Password reset otp sent successfully:', response);
    return { 
      success: true, 
      messageId: response.message_ids?.[0],
      details: response
    };

  } catch (error) {
    console.error('Failed to send password reset email:', error);
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

    return true;
  } catch (error) {
    console.error('❌ Mailtrap connection failed:', error);
    return false;
  }
};

module.exports = {
  sendFeedbackNotification,
  sendContactNotification,
  sendWelcomeEmail,
  sendRegisterOTP,
  sendPasswordResetOTP,
  testConnection
};