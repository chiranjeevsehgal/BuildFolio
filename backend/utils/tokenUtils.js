const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET;

const createTempToken = (email, otpHash) => {
  return jwt.sign(
    {
      email,
      otpHash,
      type: 'email_verification',
      attempts: 0,
      maxAttempts: 3,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: '10m' } // 10 minutes for OTP verification
  );
};

const createVerifiedToken = (email) => {
  return jwt.sign(
    {
      email,
      emailVerified: true,
      type: 'email_verified',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: '10m' } // 30 minutes to complete registration
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const updateTokenAttempts = (token, newAttempts) => {
  const decoded = jwt.verify(token, JWT_SECRET);

  // Calculate remaining time in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  const remainingTime = Math.max(0, decoded.exp - currentTime);

  // Create new payload without JWT standard claims
  const payload = {
    email: decoded.email,
    otpHash: decoded.otpHash,
    type: decoded.type,
    attempts: newAttempts,
    maxAttempts: decoded.maxAttempts,
    iat: currentTime
  };

  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: remainingTime + 's' }
  );
};

// Create temporary token for password reset
const createPasswordResetTempToken = (email, otpHash) => {
  const payload = {
    email,
    otpHash,
    type: 'password_reset',
    attempts: 0,
    maxAttempts: 3
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10m' });
};

// Create verified token for password reset
const createPasswordResetVerifiedToken = (email) => {
  const payload = {
    email,
    type: 'password_reset_verified',
    otpVerified: true
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Update attempts for password reset token
const updatePasswordResetTokenAttempts = (token, newAttempts) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newPayload = {
      ...decoded,
      attempts: newAttempts,
      iat: Math.floor(Date.now() / 1000)
    };

    delete newPayload.exp;
    return jwt.sign(newPayload, process.env.JWT_SECRET, { expiresIn: '10m' });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  createTempToken,
  createVerifiedToken,
  verifyToken,
  updateTokenAttempts,
  createPasswordResetTempToken,
  createPasswordResetVerifiedToken,
  updatePasswordResetTokenAttempts
};