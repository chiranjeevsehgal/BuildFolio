const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getJobStats,
  addAISuggestions,
} = require("../controllers/jobTrackerController");

const auth = require("../middleware/auth");
const {
  validateJob,
  validateJobStatus,
  validateAISuggestions,
} = require("../middleware/jobTrackerValidation");

// Apply authentication middleware to all routes
router.use(auth);

// @route   GET /api/jobs
// @desc    Get all jobs for authenticated user
// @access  Private
// @query   ?status=applied&search=google&page=1&limit=10
router.get("/", getAllJobs);

// @route   GET /api/jobs/stats
// @desc    Get job application statistics
// @access  Private
// Note: This route must come before /:id route to avoid conflicts
router.get("/stats", getJobStats);

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Private
router.get("/:id", getJobById);

// @route   POST /api/jobs
// @desc    Create new job application
// @access  Private
// @body    { title, company, location, salary, status, priority, jobUrl, description, appliedDate, recruiterName, contactEmail, contactPhone, notes, aiSuggestions }
router.post("/", validateJob, createJob);

// @route   PUT /api/jobs/:id
// @desc    Update job application
// @access  Private
// @body    { title, company, location, salary, status, priority, jobUrl, description, appliedDate, recruiterName, contactEmail, contactPhone, notes, aiSuggestions }
router.put("/:id", validateJob, updateJob);

// @route   PATCH /api/jobs/:id/status
// @desc    Update job status (for drag & drop)
// @access  Private
// @body    { status }
router.patch("/:id/status", validateJobStatus, updateJobStatus);

// @route   DELETE /api/jobs/:id
// @desc    Delete job application
// @access  Private
router.delete("/:id", deleteJob);

// // @route   POST /api/jobs/:id/ai-suggestions
// // @desc    Add AI suggestions to job
// // @access  Private
// // @body    { suggestions: ["suggestion1", "suggestion2"] }
// router.post('/:id/ai-suggestions', validateAISuggestions, addAISuggestions);

module.exports = router;
