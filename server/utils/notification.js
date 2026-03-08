const { Notification } = require('../models');

/**
 * Send a notification to a guest (Mocked for now)
 * @param {Object} options 
 * @param {string} options.type - PaymentConfirmation, CheckInReminder, CheckOutReminder
 * @param {string} options.message - The text to send
 * @param {string} options.recipient - Email or Phone
 * @param {number} options.bookingId
 * @param {number} options.guestId
 * @param {number} options.hotelId
 * @param {string} [options.channel='Email'] - App, Email, SMS
 */
const sendGuestNotification = async (options) => {
  try {
    const { type, message, recipient, bookingId, guestId, hotelId, channel = 'Email' } = options;

    // 1. Create the database record
    const notification = await Notification.create({
      type,
      message,
      recipient,
      channel,
      bookingId,
      guestId,
      hotelId,
      status: 'Sent' // Since we're mocking, we mark as sent
    });

    // 2. Mock sending (Console log)
    console.log(`[NOTIFICATION SERVICE] Sent ${type} to ${recipient} via ${channel}: "${message}"`);

    return notification;
  } catch (error) {
    console.error('[NOTIFICATION SERVICE ERROR]', error.message);
    // Even if sending fails, we record the attempt
    return null;
  }
};

/**
 * Scan for and send scheduled reminders
 */
const runScheduledReminders = async () => {
  const { Booking, Guest } = require('../models');
  const { Op } = require('sequelize');
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    // 1. Check-In Reminders (Booked for Tomorrow)
    const upcomingCheckIns = await Booking.findAll({
      where: {
        status: 'Confirmed',
        checkInDate: { [Op.between]: [tomorrow, new Date(tomorrow.getTime() + 86400000)] }
      },
      include: [Guest]
    });

    for (const b of upcomingCheckIns) {
       await sendGuestNotification({
         type: 'CheckInReminder',
         message: `Hi ${b.Guest?.firstName}, this is a reminder of your upcoming check-in tomorrow at our hotel. We look forward to seeing you!`,
         recipient: b.Guest?.email || b.Guest?.phone,
         bookingId: b.id,
         guestId: b.guestId,
         hotelId: b.hotelId
       });
    }

    // 2. Check-Out Reminders (Checked In and Check-Out is Today)
    const upcomingCheckOuts = await Booking.findAll({
      where: {
        status: 'Checked In',
        checkOutDate: { [Op.between]: [today, tomorrow] }
      },
      include: [Guest]
    });

    for (const b of upcomingCheckOuts) {
       await sendGuestNotification({
         type: 'CheckOutReminder',
         message: `Hi ${b.Guest?.firstName}, we hope you enjoyed your stay! This is a reminder that check-out is today. Please let us know if you need any assistance.`,
         recipient: b.Guest?.email || b.Guest?.phone,
         bookingId: b.id,
         guestId: b.guestId,
         hotelId: b.hotelId
       });
    }

    return { checkIns: upcomingCheckIns.length, checkOuts: upcomingCheckOuts.length };
  } catch (error) {
    console.error('[REMINDER SERVICE ERROR]', error.message);
    throw error;
  }
};

module.exports = { sendGuestNotification, runScheduledReminders };
