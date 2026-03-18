const { Booking, Room, BookingRoom, Hotel } = require('../models');
const { Op } = require('sequelize');
const { logActivity } = require('./activityLogger');
const { getIO } = require('./socket');

/**
 * Clean up pending bookings that have expired (stayed pending for too long).
 * This fires a removal code after checking the duration.
 */
const cleanupExpiredBookings = async () => {
  try {
    const hotels = await Hotel.findAll({ attributes: ['id', 'pendingReservationDuration'] });
    
    for (const hotel of hotels) {
      const duration = hotel.pendingReservationDuration || 60; // Default 60 minutes
      const expiryTime = new Date(Date.now() - duration * 60 * 1000);

      // Find all pending bookings for this hotel that are older than the expiry time
      const expiredBookings = await Booking.findAll({
        where: {
          hotelId: hotel.id,
          status: 'Pending',
          createdAt: { [Op.lt]: expiryTime }
        },
        include: [{ model: Room, through: { attributes: [] } }]
      });

      if (expiredBookings.length === 0) continue;

      for (const booking of expiredBookings) {
        const roomIds = booking.Rooms.map(r => r.id);
        const bookingId = booking.id;

        // Cancel the booking (or delete it as per "removed from the list")
        // The user said "removed from the list", so we'll set status to 'Cancelled' or 'Expired'
        // or just delete it. Given the context of "removed from the list", we'll use 'Cancelled'
        // so it's traceable, or we can delete if preferred.
        // In this system, 'Cancelled' status makes it easier to track.
        // However, if the user strictly wants it "removed", we'll delete.
        // Let's use 'Cancelled' to be safe but the list usually filters these.
        // Looking at the dashboard, 'Cancelled' bookings actually show up in the "All" and "Cancelled" tabs.
        // If they want it COMPLETELY REMOVED, we should destroy it.
        // The user said "must be removed from the list".
        
        await booking.update({ status: 'Cancelled' }); // Update to Cancelled first to trigger hooks if any
        // If they want it physically removed:
        // await booking.destroy(); 
        
        // Ensure rooms associated with this booking are marked as 'Available'
        if (roomIds.length > 0) {
          await Room.update(
            { status: 'Available' },
            { where: { id: { [Op.in]: roomIds } } }
          );
        }

        console.log(`[CLEANUP] Booking #${bookingId} for Hotel #${hotel.id} has been cancelled due to expiration.`);

        // Notify via socket for real-time dashboard update
        try {
          getIO().emit('bookingUpdate', { id: bookingId, status: 'Cancelled' });
        } catch (err) {
          // ignore socket errors during cleanup
        }
      }
    }
  } catch (error) {
    console.error('[CLEANUP ERROR]:', error);
  }
};

module.exports = { cleanupExpiredBookings };
