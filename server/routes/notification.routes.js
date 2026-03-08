const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { isHotelAdmin } = require('../middleware/auth.middleware');

router.get('/', isHotelAdmin, notificationController.getNotifications);
router.post('/trigger-reminders', isHotelAdmin, notificationController.triggerReminders);

module.exports = router;
