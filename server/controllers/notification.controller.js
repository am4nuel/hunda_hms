const { Notification, Guest, Booking } = require('../models');
const { runScheduledReminders } = require('../utils/notification');

const getNotifications = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });

    const notifications = await Notification.findAll({
      where: { hotelId },
      include: [
        { model: Guest, attributes: ['firstName', 'lastName'] },
        { model: Booking, attributes: ['id', 'status'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const triggerReminders = async (req, res) => {
  try {
    const stats = await runScheduledReminders();
    res.status(200).json({ message: 'Reminders processed', stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, triggerReminders };
