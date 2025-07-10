const Notification = require("../models/Notification");
const User = require("../models/User");

class NotificationService {
  /**
   * Send welcome notification to new user
   * @param {ObjectId} userId - The ID of the newly registered user
   * @param {Object} userInfo - Additional user information (firstName, lastName, etc.)
   * @returns {Object} - Success/failure response
   */
  static async sendWelcomeNotification(userId, userInfo = {}) {
    try {
      const { firstName = "there" } = userInfo;

      // Prepare welcome notification data
      const welcomeData = {
        title: `Welcome to Buildfolio, ${firstName}! 🎉`,
        message: `Hey ${firstName}! Welcome to Buildfolio - your journey to creating an amazing portfolio starts now.`,
        type: "success",
        recipients: [
          {
            userId: userId,
            isRead: false,
            readAt: null,
          },
        ],
        isGlobal: false,
        actionUrl: "/profile",
        actionText: "Complete Your Profile",
        priority: "high",
        createdBy: null,
        // Set expiration to 30 days
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      // Create and save the notification
      const notification = new Notification(welcomeData);
      await notification.save();

      return {
        success: true,
        message: "Welcome notification sent successfully",
        notificationId: notification._id,
      };
    } catch (error) {
      console.error("Welcome notification error:", error);
      return {
        success: false,
        message: "Failed to send welcome notification",
        error: error.message,
      };
    }
  }

  /**
   * Send profile completion reminder notification
   * @param {ObjectId} userId - The user ID
   * @param {Object} userInfo - User information
   * @returns {Object} - Success/failure response
   */
  static async sendProfileCompletionReminder(userId, userInfo = {}) {
    try {
      const { firstName = "there" } = userInfo;

      const reminderData = {
        title: `Complete Your Profile, ${firstName}! 📝`,
        message: `Hi ${firstName}! You're just a few steps away from having an amazing portfolio. Complete your profile to unlock all Buildfolio features and make your portfolio shine!`,
        type: "reminder",
        recipients: [
          {
            userId: userId,
            isRead: false,
            readAt: null,
          },
        ],
        isGlobal: false,
        actionUrl: "/profile/complete",
        actionText: "Complete Profile",
        priority: "medium",
        createdBy: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      const notification = new Notification(reminderData);
      await notification.save();

      return {
        success: true,
        message: "Profile completion reminder sent successfully",
        notificationId: notification._id,
      };
    } catch (error) {
      console.error("Profile completion reminder error:", error);
      return {
        success: false,
        message: "Failed to send profile completion reminder",
        error: error.message,
      };
    }
  }

  /**
   * Send template selection notification
   * @param {ObjectId} userId - The user ID
   * @param {Object} userInfo - User information
   * @returns {Object} - Success/failure response
   */
  static async sendTemplateSelectionNotification(userId, userInfo = {}) {
    try {
      const { firstName = "there" } = userInfo;

      const templateData = {
        title: `Choose Your Template, ${firstName}! 🎨`,
        message: `Great job completing your profile, ${firstName}! Now let's pick the perfect template for your portfolio. We have amazing designs waiting for you!`,
        type: "action_required",
        recipients: [
          {
            userId: userId,
            isRead: false,
            readAt: null,
          },
        ],
        isGlobal: false,
        actionUrl: "/templates",
        actionText: "Choose Template",
        priority: "high",
        createdBy: null,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      };

      const notification = new Notification(templateData);
      await notification.save();

      return {
        success: true,
        message: "Template selection notification sent successfully",
        notificationId: notification._id,
      };
    } catch (error) {
      console.error("Template selection notification error:", error);
      return {
        success: false,
        message: "Failed to send template selection notification",
        error: error.message,
      };
    }
  }

  /**
   * Send portfolio deployment success notification
   * @param {ObjectId} userId - The user ID
   * @param {Object} portfolioInfo - Portfolio information (URL, template name, etc.)
   * @returns {Object} - Success/failure response
   */
  static async sendPortfolioDeployedNotification(userId, portfolioInfo = {}) {
    try {
      const { firstName = "there", portfolioUrl, templateName } = portfolioInfo;

      const deploymentData = {
        title: `🚀 Your Portfolio is Live, ${firstName}!`,
        message: `Congratulations ${firstName}! Your portfolio using the ${templateName || "selected"} template is now live and ready to impress. Share it with the world!`,
        type: "success",
        recipients: [
          {
            userId: userId,
            isRead: false,
            readAt: null,
          },
        ],
        isGlobal: false,
        actionUrl: portfolioUrl || "/portfolio",
        actionText: "View Portfolio",
        priority: "high",
        createdBy: null,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      };

      const notification = new Notification(deploymentData);
      await notification.save();

      return {
        success: true,
        message: "Portfolio deployment notification sent successfully",
        notificationId: notification._id,
      };
    } catch (error) {
      console.error("Portfolio deployment notification error:", error);
      return {
        success: false,
        message: "Failed to send portfolio deployment notification",
        error: error.message,
      };
    }
  }

  /**
   * Send milestone achievement notification
   * @param {ObjectId} userId - The user ID
   * @param {Object} milestoneInfo - Milestone information
   * @returns {Object} - Success/failure response
   */
  static async sendMilestoneNotification(userId, milestoneInfo = {}) {
    try {
      const {
        firstName = "there",
        milestone,
        description,
        icon = "🏆",
      } = milestoneInfo;

      const milestoneData = {
        title: `${icon} Achievement Unlocked, ${firstName}!`,
        message: `Amazing work, ${firstName}! You've reached a new milestone: ${milestone}. ${description || "Keep up the great work on your portfolio journey!"}`,
        type: "achievement",
        recipients: [
          {
            userId: userId,
            isRead: false,
            readAt: null,
          },
        ],
        isGlobal: false,
        actionUrl: "/dashboard",
        actionText: "View Dashboard",
        priority: "medium",
        createdBy: null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      const notification = new Notification(milestoneData);
      await notification.save();

      return {
        success: true,
        message: "Milestone notification sent successfully",
        notificationId: notification._id,
      };
    } catch (error) {
      console.error("Milestone notification error:", error);
      return {
        success: false,
        message: "Failed to send milestone notification",
        error: error.message,
      };
    }
  }

  /**
   * Send maintenance/update notification to all users
   * @param {Object} updateInfo - Update information
   * @returns {Object} - Success/failure response
   */
  static async sendMaintenanceNotification(updateInfo = {}) {
    try {
      const {
        title = "🔧 System Maintenance Notice",
        message = "We will be performing scheduled maintenance to improve your Buildfolio experience.",
        maintenanceDate,
        duration = "2 hours",
        adminUserId,
      } = updateInfo;

      // Get all active users
      const activeUsers = await User.find({ isActive: true }).select("_id");
      const recipients = activeUsers.map((user) => ({
        userId: user._id,
        isRead: false,
        readAt: null,
      }));

      const maintenanceData = {
        title,
        message: `${message} ${maintenanceDate ? `Scheduled for: ${maintenanceDate}` : ""} (Duration: ${duration}). We appreciate your patience!`,
        type: "maintenance",
        recipients,
        isGlobal: true,
        actionUrl: "/status",
        actionText: "Check Status",
        priority: "high",
        createdBy: adminUserId || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      const notification = new Notification(maintenanceData);
      await notification.save();

      return {
        success: true,
        message: `Maintenance notification sent to ${recipients.length} users`,
        notificationId: notification._id,
        recipientCount: recipients.length,
      };
    } catch (error) {
      console.error("Maintenance notification error:", error);
      return {
        success: false,
        message: "Failed to send maintenance notification",
        error: error.message,
      };
    }
  }

  /**
   * Send feature announcement notification
   * @param {Object} featureInfo - Feature information
   * @returns {Object} - Success/failure response
   */
  static async sendFeatureAnnouncementNotification(featureInfo = {}) {
    try {
      const {
        featureName = "New Feature",
        description = "Check out the latest updates to Buildfolio!",
        actionUrl = "/features",
        adminUserId,
      } = featureInfo;

      // Get all active users
      const activeUsers = await User.find({ isActive: true }).select("_id");
      const recipients = activeUsers.map((user) => ({
        userId: user._id,
        isRead: false,
        readAt: null,
      }));

      const featureData = {
        title: `🎉 New Feature: ${featureName}`,
        message: `Exciting news! We've just launched ${featureName}. ${description} Your Buildfolio experience just got even better!`,
        type: "feature",
        recipients,
        isGlobal: true,
        actionUrl,
        actionText: "Explore Feature",
        priority: "medium",
        createdBy: adminUserId || null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      const notification = new Notification(featureData);
      await notification.save();

      return {
        success: true,
        message: `Feature announcement sent to ${recipients.length} users`,
        notificationId: notification._id,
        recipientCount: recipients.length,
      };
    } catch (error) {
      console.error("Feature announcement notification error:", error);
      return {
        success: false,
        message: "Failed to send feature announcement notification",
        error: error.message,
      };
    }
  }

  /**
   * Schedule delayed notification (useful for follow-ups)
   * @param {Function} notificationMethod - The notification method to call
   * @param {Array} args - Arguments for the notification method
   * @param {number} delayInHours - Delay in hours
   */
  static scheduleDelayedNotification(
    notificationMethod,
    args,
    delayInHours = 24,
  ) {
    const delayMs = delayInHours * 60 * 60 * 1000; // Convert hours to milliseconds

    setTimeout(async () => {
      try {
        await notificationMethod(...args);
      } catch (error) {
        console.error("Delayed notification error:", error);
      }
    }, delayMs);
  }
}

module.exports = NotificationService;
