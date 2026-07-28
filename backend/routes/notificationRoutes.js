const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.use(protect);

router.get('/unread-count', notificationController.getUnreadCount);

router.get('/', notificationController.getNotifications);

router.put('/read-all', notificationController.markAllAsRead);

router.put('/read/:id', notificationController.markAsRead);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
