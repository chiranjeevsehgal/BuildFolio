const Notification = require("../models/Notification");
const User = require("../models/User");

// @desc    Send notification to specific users
// @route   POST /api/notifications/send
// @access  Private (Admin only)
const sendNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "info",
      userIds = [],
      isGlobal = false,
      actionUrl,
      actionText,
      priority = "medium",
      expiresIn, // in hours
    } = req.body;
    const createdBy = req.user._id;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    let recipients = [];
    let targetUsers = [];

    if (isGlobal) {
      // Send to all users
      const allUsers = await User.find({ isActive: true }).select("_id");
      targetUsers = allUsers;
    } else {
      // Send to specific users
      if (!userIds || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "User IDs are required for targeted notifications",
        });
      }

      const users = await User.find({ _id: { $in: userIds } }).select("_id");
      targetUsers = users;
    }

    // Prepare recipients array
    recipients = targetUsers.map((user) => ({
      userId: user._id,
      isRead: false,
      readAt: null,
    }));

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
    }

    // Create notification
    const notification = new Notification({
      title,
      message,
      type,
      recipients,
      isGlobal,
      actionUrl,
      actionText,
      createdBy,
      priority,
      expiresAt,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: `Notification sent to ${recipients.length} user(s)`,
      data: {
        notificationId: notification._id,
        recipientCount: recipients.length,
        isGlobal,
        type,
        priority,
      },
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

    const skip = (page - 1) * limit;

    // Build query - ONLY show notifications meant for this user
    const query = {
      $or: [
        // Global notifications (meant for everyone)
        { isGlobal: true },
        // Specific notifications where this user is a recipient
        {
          isGlobal: false,
          "recipients.userId": userId,
        },
      ],
    };

    // Add filters
    if (type) {
      query.type = type;
    }

    // Get notifications
    let notifications = await Notification.find(query)
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Process notifications to add user-specific read status
    notifications = notifications.map((notification) => {
      // Find user's read status in recipients
      const userRecipient = notification.recipients.find(
        (r) => r.userId.toString() === userId.toString(),
      );

      return {
        // ...notification,
        message: notification.message,
        title: notification.title,
        _id: notification._id,
        type: notification.type,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        priority: notification.priority,
        expiresAt: notification.expiresAt,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        isRead: userRecipient?.isRead || false,
        readAt: userRecipient?.readAt || null,
        // Remove recipients array for privacy (optional)
        recipients: undefined,
      };
    });

    // Filter unread if requested
    if (unreadOnly === "true") {
      notifications = notifications.filter((n) => !n.isRead);
    }

    // Get total count
    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notifications",
      error: error.message,
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if user is recipient

    const recipientIndex = notification.recipients.findIndex(
      (r) => r.userId.toString() === userId.toString(),
    );

    if (recipientIndex === -1) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to read this notification",
      });
    }

    // Mark as read
    notification.recipients[recipientIndex].isRead = true;
    notification.recipients[recipientIndex].readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    // Update all targeted notifications for this user
    await Notification.updateMany(
      { "recipients.userId": userId },
      {
        $set: {
          "recipients.$.isRead": true,
          "recipients.$.readAt": new Date(),
        },
      },
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// @desc    Delete notification (Admin only)
// @route   DELETE /api/notifications/:id
// @access  Private (Admin only)
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// Helper function to get unread count
const getUnreadCount = async (userId) => {
  try {
    // Count targeted unread notifications
    const count = await Notification.countDocuments({
      recipients: {
        $elemMatch: {
          userId: userId,
          isRead: false,
        },
      },
    });

    return count;
  } catch (error) {
    console.error("Get unread count error:", error);
    return 0;
  }
};

// @desc    Get unread count for user
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCountEndpoint = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
    });
  }
};

// @desc    Send bulk notifications with filters
// @route   POST /api/notifications/bulk
// @access  Private (Admin only)
const sendBulkNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "announcement",
      filters = {}, // { role: 'user', isActive: true, portfolioDeployed: true }
      actionUrl,
      actionText,
      priority = "medium",
    } = req.body;

    const createdBy = req.user._id;

    // Build user query based on filters
    let userQuery = { isActive: true };

    if (filters.role) {
      userQuery.role = filters.role;
    }
    if (filters.isProfileCompleted !== undefined) {
      userQuery.isProfileCompleted = filters.isProfileCompleted;
    }
    if (filters.portfolioDeployed !== undefined) {
      userQuery.portfolioDeployed = filters.portfolioDeployed;
    }

    const targetUsers = await User.find(userQuery).select("_id");

    const recipients = targetUsers.map((user) => ({
      userId: user._id,
      isRead: false,
      readAt: null,
    }));

    const notification = new Notification({
      title,
      message,
      type,
      recipients,
      isGlobal: false,
      actionUrl,
      actionText,
      createdBy,
      priority,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: `Bulk notification sent to ${recipients.length} user(s)`,
      data: {
        notificationId: notification._id,
        recipientCount: recipients.length,
        filters: userQuery,
      },
    });
  } catch (error) {
    console.error("Send bulk notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk notification",
      error: error.message,
    });
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCountEndpoint,
  sendBulkNotification,
};
