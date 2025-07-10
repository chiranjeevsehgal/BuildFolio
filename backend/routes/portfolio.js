const express = require("express");
const router = express.Router();
const {
  deployPortfolio,
  redeployPortfolio,
  getPublicPortfolio,
  getUserPortfolio,
  deletePortfolio,
  updatePortfolioStatus,
  getPortfolioAnalytics,
  checkUsernameAvailability,
  updateSelectedTemplate,
  unpublishPortfolio,
} = require("../controllers/portfolioController");
const { protect } = require("../middleware/auth");
const auth = require("../middleware/auth");

// @desc    Deploy user's portfolio
// @route   POST /api/portfolio/deploy
// @access  Private
router.post("/deploy", auth, deployPortfolio);

// @desc    Unpublish deployment for user's portfolio
// @route   POST /api/portfolio/unpublish
// @access  Private
router.patch("/unpublish", auth, unpublishPortfolio);

// @desc    Redeploy/update user's portfolio
// @route   POST /api/portfolio/redeploy
// @access  Private
router.post("/redeploy", auth, redeployPortfolio);

// @desc    Get public portfolio by username
// @route   GET /api/portfolio/public/:username
// @access  Public
router.get("/public/:username", getPublicPortfolio);

// @desc    Get user's own portfolio info
// @route   GET /api/portfolio/me
// @access  Private
router.get("/me", auth, getUserPortfolio);

// @desc    Delete user's portfolio deployment
// @route   DELETE /api/portfolio
// @access  Private
router.delete("/", auth, deletePortfolio);

// @desc    Update portfolio status (active/inactive)
// @route   PATCH /api/portfolio/status
// @access  Private
router.patch("/status", auth, updatePortfolioStatus);

// @desc    Get portfolio analytics
// @route   GET /api/portfolio/analytics
// @access  Private
router.get("/analytics", auth, getPortfolioAnalytics);

// @desc    Check username availability
// @route   GET /api/portfolio/check-username/:username
// @access  Private
router.get("/check-username/:username", auth, checkUsernameAvailability);

module.exports = router;
