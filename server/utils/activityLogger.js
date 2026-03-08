const { ActivityLog } = require('../models');

/**
 * Logs a user activity to the database.
 * @param {Object} params
 * @param {string} params.action - e.g., 'CREATE_BOOKING'
 * @param {string} params.module - e.g., 'Booking'
 * @param {string} params.details - JSON string/text of what changed
 * @param {number} params.userId - ID of the user performing the action
 * @param {number} params.hotelId - ID of the hotel
 * @param {Object} [params.req] - Optional request object to extract IP and UserAgent
 */
const logActivity = async ({ action, module, details, userId, hotelId, req }) => {
  try {
    await ActivityLog.create({
      action,
      module,
      details,
      userId,
      userName: req?.user?.userName || 'System',
      userRole: req?.user?.role || 'system',
      hotelId,
      ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null,
      userAgent: req ? req.headers['user-agent'] : null
    });
  } catch (error) {
    console.error('FAILED TO LOG ACTIVITY:', error);
  }
};

module.exports = { logActivity };
