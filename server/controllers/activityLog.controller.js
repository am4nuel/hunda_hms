const { ActivityLog, SystemUser } = require('../models');

// @desc    Get all activity logs for a hotel
// @route   GET /api/activity-logs
exports.getAllLogs = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });

    const logs = await ActivityLog.findAll({
      where: { hotelId },
      include: [{ 
        model: SystemUser, 
        as: 'user', 
        attributes: ['firstName', 'lastName', 'role', 'id'] 
      }],
      order: [['createdAt', 'DESC']],
      limit: 100 // Last 100 logs for now
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
