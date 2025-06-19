const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const {
  getMyProfile,
  updateProfile,
  uploadProfilePhoto,
  importLinkedInProfile,
  updateUserTemplate,
  getSettingsData,
  updateSettingsPersonalData,
  updateSettingsResumeData,
  changeUsername,
  changePassword,
  deactivateAccount,
  reactivateAccount
} = require('../controllers/profileController');
const auth = require('../middleware/auth');

const router = express.Router();

// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
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

const settingsPersonalDataValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 0, max: 50 })
    .withMessage('Last name must be between 0 and 50 characters')
    .matches(/^[a-zA-Z\s'-]*$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('careerStage')
    .optional({ checkFalsy: true })
    .isIn([
      'Entry Level (0-2 Years)',
      'Mid Level (2-6 Years)',
      'Senior Level (6-12 Years)',
      'Executive Level (12+ Years)'
    ])
    .withMessage('Invalid career stage selected')
];

const settingsResumeDataValidation = [
  body('industry')
    .optional({ checkFalsy: true })
    .isIn([
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'Marketing',
      'Sales',
      'Engineering',
      'Design',
      'Other'
    ])
    .withMessage('Invalid industry selected'),

  body('jobSearchTimeline')
    .optional({ checkFalsy: true })
    .isIn([
      'Immediately',
      'Within 1 month',
      'Within 3 months',
      'Within 6 months',
      'Not actively looking'
    ])
    .withMessage('Invalid jobSearchTimeline selected'),

  body('resumeExperience')
    .optional()
    .trim()
    .isLength({ min: 0, max: 500 })
    .withMessage('Resume experience must be between 0 and 500 characters')
    .matches(/^[a-zA-Z0-9\s.,!?;:()\-'"&%@#$+=/_]*$/)
    .withMessage('Resume experience contains invalid characters')
];



const usernameValidation = [
    body('newUsername')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
        .custom((value) => {
            // Additional custom validations
            if (value.startsWith('-') || value.endsWith('-')) {
                throw new Error('Username cannot start or end with a hyphen');
            }
            if (value.startsWith('_') || value.endsWith('_')) {
                throw new Error('Username cannot start or end with an underscore');
            }
            return true;
        })
];


const passwordChangeValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 8, max: 128 })
        .withMessage('New password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        })
];

// Routes
router.get('/me', auth, getMyProfile);
router.put('/me', auth, profileValidation, updateProfile);
router.post('/photo', auth, upload.single('profilePhoto'), uploadProfilePhoto);
router.put('/change-username', auth, usernameValidation, changeUsername);
router.patch('/template', auth, updateUserTemplate);

router.get('/settings', auth, getSettingsData);
router.put('/settings/personal', auth, settingsPersonalDataValidation, updateSettingsPersonalData);
router.put('/settings/resume', auth, settingsResumeDataValidation, updateSettingsResumeData);

router.put('/change-password', auth, passwordChangeValidation, changePassword);

router.patch('/deactivate-account', auth, deactivateAccount);
router.patch('/reactivate-account', auth, reactivateAccount);


module.exports = router;
