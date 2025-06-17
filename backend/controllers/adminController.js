const User = require("../models/User");

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('_id firstName lastName username email role portfolioDeployed isProfileCompleted isActive createdAt selectedTemplate subscriptionType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

module.exports = {
  getAllUsers
};