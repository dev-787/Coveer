const router       = require('express').Router();
const { authUser } = require('../middlewares/auth.middleware');
const Notification = require('../models/notification.model');

// GET /notifications — fetch latest 30 for this user
router.get('/', authUser, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    const unreadCount = notifications.filter(n => !n.read).length;
    return res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PATCH /notifications/read-all — mark all as read
router.patch('/read-all', authUser, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    return res.status(200).json({ message: 'All marked as read' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to mark as read' });
  }
});

module.exports = router;
