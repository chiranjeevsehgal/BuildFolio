const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/emailService');
const NotificationService = require('../utils/notificationService');

// Serializing user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializing user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Auth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'google' });

    if (user) {
      return done(null, user);
    }
    // Check if email exists
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      // Link accounts
      user.oauthProvider = 'google';
      user.oauthId = profile.id;
      await user.save();
      return done(null, user);
    }
    const username = profile.emails[0].value.split('@')[0];

    // Create new user
    user = await User.create({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName || '',
      email: profile.emails[0].value,
      username: username,
      oauthProvider: 'google',
      oauthId: profile.id,
      isEmailVerified: true,
      // profilePhoto: profile.photos[0]?.value
    });

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

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

module.exports = passport;