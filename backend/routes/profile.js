const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const {
  getMyProfile,
  updateProfile,
  uploadProfilePhoto,
  importLinkedInProfile
} = require('../controllers/profileController');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer configuration for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation rules
const profileValidation = [
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('summary')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Summary cannot exceed 1000 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters')
];

// Routes
router.get('/me', auth, getMyProfile);
router.put('/me', auth, profileValidation, updateProfile);
router.post('/photo', auth, upload.single('photo'), uploadProfilePhoto);
router.post('/linkedin-import', auth, importLinkedInProfile);

module.exports = router;
