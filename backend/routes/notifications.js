const express = require("express");
const router = express.Router();
const {
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCountEndpoint,
  sendBulkNotification,
} = require("../controllers/notificationController");
const { adminOnly } = require("../middleware/auth");
const auth = require("../middleware/auth");

// User routes
router.get("/", auth, getUserNotifications);
router.get("/unread-count", auth, getUnreadCountEndpoint);
router.patch("/:id/read", auth, markAsRead);
router.patch("/read-all", auth, markAllAsRead);

// Admin routes
router.post("/send", auth, adminOnly, sendNotification);
router.post("/bulk", auth, adminOnly, sendBulkNotification);
router.delete("/:id", auth, adminOnly, deleteNotification);

module.exports = router;
