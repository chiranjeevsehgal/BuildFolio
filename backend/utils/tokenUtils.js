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

module.exports = {
  createTempToken,
  createVerifiedToken,
  verifyToken,
  updateTokenAttempts
};