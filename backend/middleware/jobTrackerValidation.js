const { body, validationResult } = require("express-validator");

// Validation rules for creating/updating jobs
const validateJob = [
  // Required fields
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Job title must be between 1 and 200 characters"),

  body("company")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Company name must be between 1 and 100 characters"),

  // Optional fields with validation
  body("location")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Location cannot exceed 100 characters"),

  body("salary")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Salary cannot exceed 50 characters"),

  body("status")
    .optional()
    .isIn(["applied", "interview", "in-progress", "offer", "rejected"])
    .withMessage(
      "Status must be one of: applied, interview, in-progress, offer, rejected",
    ),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),

  body("jobUrl")
    .optional()
    .trim()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/.+/)) {
        throw new Error(
          "Job URL must be a valid URL starting with http:// or https://",
        );
      }
      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),

  body("appliedDate")
    .optional()
    .isISO8601()
    .withMessage("Applied date must be a valid date"),

  body("recruiterName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Recruiter name cannot exceed 100 characters"),

  body("contactEmail")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Contact email must be a valid email address")
    .normalizeEmail(),

  body("contactPhone")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Contact phone cannot exceed 20 characters"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Notes cannot exceed 2000 characters"),

  body("aiSuggestions")
    .optional()
    .isArray()
    .withMessage("AI suggestions must be an array")
    .custom((suggestions) => {
      if (suggestions && suggestions.length > 0) {
        for (let suggestion of suggestions) {
          if (
            typeof suggestion !== "string" ||
            suggestion.trim().length === 0
          ) {
            throw new Error("Each AI suggestion must be a non-empty string");
          }
          if (suggestion.length > 500) {
            throw new Error("Each AI suggestion cannot exceed 500 characters");
          }
        }
      }
      return true;
    }),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
          value: error.value,
        })),
      });
    }
    next();
  },
];

// Validation rules for updating job status (drag & drop)
const validateJobStatus = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["applied", "interview", "in-progress", "offer", "rejected"])
    .withMessage(
      "Status must be one of: applied, interview, in-progress, offer, rejected",
    ),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
          value: error.value,
        })),
      });
    }
    next();
  },
];

// Validation rules for AI suggestions
const validateAISuggestions = [
  body("suggestions")
    .notEmpty()
    .withMessage("Suggestions array is required")
    .isArray({ min: 1 })
    .withMessage("Suggestions must be a non-empty array")
    .custom((suggestions) => {
      for (let suggestion of suggestions) {
        if (typeof suggestion !== "string" || suggestion.trim().length === 0) {
          throw new Error("Each suggestion must be a non-empty string");
        }
        if (suggestion.length > 500) {
          throw new Error("Each suggestion cannot exceed 500 characters");
        }
      }
      return true;
    }),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
          value: error.value,
        })),
      });
    }
    next();
  },
];

module.exports = {
  validateJob,
  validateJobStatus,
  validateAISuggestions,
};
