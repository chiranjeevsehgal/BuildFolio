const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

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
  callbackURL: '/api/auth/google/callback'
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

    // Create new user
    user = await User.create({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      oauthProvider: 'google',
      oauthId: profile.id,
      isEmailVerified: true,
      profilePhoto: profile.photos[0]?.value
    });

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// LinkedIn and GitHub strategies

module.exports = passport;