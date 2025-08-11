const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

// Get notifications for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort(
      { createdAt: -1 }
    );
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark notification as read
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif || notif.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notif.isRead = true;
    await notif.save();
    res.json(notif);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
