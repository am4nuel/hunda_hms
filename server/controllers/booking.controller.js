const { Booking, Guest, Room, RoomType, BookingRoom, Bank, Order, OrderItem, MenuItem } = require('../models');
const { logActivity } = require('../utils/activityLogger');
const { Op } = require('sequelize');
const sequelize = require('../db');
const { getIO } = require('../utils/socket');
const { sendGuestNotification } = require('../utils/notification');

// Helper: calculate nights between two dates
const calcNights = (checkIn, checkOut) => {
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// @desc    Get all bookings for a hotel
// @route   GET /api/bookings
const getBookings = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { status, userId } = req.query;
    
    const where = { hotelId };
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: Guest, attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'idType', 'idFront', 'idBack'] },
        {
          model: Room,
          through: { attributes: ['priceAtBooking'] },
          include: [{ model: RoomType, attributes: ['name'] }],
          attributes: ['id', 'roomNumber', 'status']
        },
        { model: Bank, attributes: ['id', 'name', 'accountNumber', 'accountHolder'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { guestId, roomIds, checkInDate, checkOutDate, specialRequests, bankId, paymentReceipt, userId } = req.body;

    if (!guestId || !roomIds || roomIds.length === 0 || !checkInDate || !checkOutDate) {
      await t.rollback();
      return res.status(400).json({ message: 'Guest, rooms, and dates are required' });
    }

    // Verify all rooms belong to this hotel
    const rooms = await Room.findAll({
      where: { id: { [Op.in]: roomIds }, hotelId },
      include: [{ model: RoomType, attributes: ['basePrice'] }],
      transaction: t
    });

    if (rooms.length !== roomIds.length) {
      await t.rollback();
      return res.status(400).json({ message: 'One or more rooms were not found' });
    }

    // Check for overlapping bookings
    const overlaps = await Booking.findAll({
      where: {
        hotelId,
        status: { [Op.notIn]: ['Cancelled', 'Checked Out'] },
        checkInDate: { [Op.lt]: checkOutDate },
        checkOutDate: { [Op.gt]: checkInDate }
      },
      include: [{
        model: Room,
        where: { id: { [Op.in]: roomIds } },
        attributes: ['id', 'roomNumber']
      }],
      transaction: t
    });

    if (overlaps.length > 0) {
      const busyRooms = [...new Set(overlaps.flatMap(b => b.Rooms.map(r => r.roomNumber)))];
      await t.rollback();
      return res.status(400).json({ 
        message: `Reservation failed: Room(s) ${busyRooms.join(', ')} are already reserved for these dates.`,
        busyRooms
      });
    }

    const nights = calcNights(checkInDate, checkOutDate);
    const totalAmount = rooms.reduce((sum, room) => {
      return sum + parseFloat(room.RoomType.basePrice) * nights;
    }, 0);

    // Verify guest and ensure we use their historic userId if one exists
    const guest = await Guest.findByPk(guestId, { transaction: t });
    if (!guest) {
      await t.rollback();
      return res.status(404).json({ message: 'Guest not found' });
    }
    const finalUserId = guest.userId || userId;

    // Create the booking
    const booking = await Booking.create({
      guestId, checkInDate, checkOutDate,
      bookedNights: nights,
      totalAmount,
      status: 'Pending', 
      specialRequests, 
      hotelId,
      bankId,
      paymentReceipt,
      userId: finalUserId
    }, { transaction: t });

    // Create BookingRoom join entries
    await BookingRoom.bulkCreate(
      rooms.map(room => ({
        bookingId: booking.id,
        roomId: room.id,
        priceAtBooking: parseFloat(room.RoomType.basePrice) * nights
      })),
      { transaction: t }
    );

    // Physical room status should only change at check-in (to 'Occupied')
    // or checkout (to 'Available'). We no longer use 'Booked' globally
    // to allow future reservations while the room is physically free.
    // await Room.update(
    //   { status: 'Booked' },
    //   { where: { id: { [Op.in]: roomIds } }, transaction: t }
    // );

    await t.commit();

    await logActivity({
      action: 'CREATE_BOOKING',
      module: 'Booking',
      details: `Created booking ID ${booking.id} for guest ID ${guestId}`,
      userId: req.user?.id || finalUserId,
      hotelId,
      req
    });

    // Return full booking with associations
    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Guest, attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        {
          model: Room,
          through: { attributes: ['priceAtBooking'] },
          include: [{ model: RoomType, attributes: ['name'] }],
          attributes: ['id', 'roomNumber', 'status']
        }
      ]
    });

    res.status(201).json(fullBooking);

    // Real-time update
    try {
      getIO().emit('newBooking', fullBooking);
    } catch (err) {
      console.error('Socket emit error:', err);
    }
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a booking (dates, special requests)
// @route   PUT /api/bookings/:id
const updateBooking = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { id } = req.params;
    const { checkInDate, checkOutDate, specialRequests } = req.body;

    const booking = await Booking.findOne({ where: { id, hotelId } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (['Checked In', 'Checked Out', 'Cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot modify a booking with status: ${booking.status}` });
    }

    await booking.update({ checkInDate, checkOutDate, specialRequests, bankId: req.body.bankId, paymentReceipt: req.body.paymentReceipt });
    
    // Real-time update
    try {
      getIO().emit('bookingUpdate', { id: booking.id, status: booking.status, ...req.body });
    } catch (err) { }

    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Confirm a booking (Pending -> Confirmed)
// @route   PATCH /api/bookings/:id/confirm
const confirmBooking = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;

    const booking = await Booking.findOne({ where: { id, hotelId } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'Pending') return res.status(400).json({ message: 'Only pending bookings can be confirmed' });

    await booking.update({ status: 'Confirmed' });

    await logActivity({
      action: 'CONFIRM_BOOKING',
      module: 'Booking',
      details: `Confirmed booking ID ${id}`,
      userId: req.user?.id,
      hotelId,
      req
    });

    // Real-time update
    try {
      getIO().emit('bookingStatusUpdate', { 
        bookingId: booking.id, 
        status: 'Confirmed',
        userId: booking.userId,
        message: 'Your reservation has been confirmed! We look forward to welcoming you.'
      });
    } catch (err) { }

    // Automated Notification: Payment/Reservation Confirmation
    const guest = await Guest.findByPk(booking.guestId);
    if (guest) {
      await sendGuestNotification({
        type: 'PaymentConfirmation',
        message: `Dear ${guest.firstName}, your reservation #${booking.id} is now CONFIRMED. We look forward to your arrival on ${new Date(booking.checkInDate).toLocaleDateString()}.`,
        recipient: guest.email || guest.phone,
        bookingId: booking.id,
        guestId: guest.id,
        hotelId: booking.hotelId,
        channel: guest.email ? 'Email' : 'SMS'
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check in a booking
// @route   PATCH /api/bookings/:id/check-in
const checkIn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: { id, hotelId },
      include: [{ model: Room, through: { attributes: [] } }],
      transaction: t
    });

    if (!booking) { await t.rollback(); return res.status(404).json({ message: 'Booking not found' }); }
    if (booking.status !== 'Confirmed') { await t.rollback(); return res.status(400).json({ message: 'Only confirmed bookings can be checked in' }); }

    const roomIds = booking.Rooms.map(r => r.id);
    await booking.update({ status: 'Checked In' }, { transaction: t });
    await Room.update({ status: 'Occupied' }, { where: { id: { [Op.in]: roomIds } }, transaction: t });

    await t.commit();
    
    await logActivity({
      action: 'CHECK_IN',
      module: 'Booking',
      details: `Checked in booking ID ${id}`,
      userId: req.user?.id,
      hotelId,
      req
    });

    // Real-time update
    try {
      getIO().emit('bookingStatusUpdate', { 
        bookingId: id, 
        status: 'Checked In',
        userId: booking.userId,
        message: 'You are now checked in! Enjoy your stay.'
      });
    } catch (err) { }

    // Automated Notification: Welcome / Check-In Reminder
    const guest = await Guest.findByPk(booking.guestId);
    if (guest) {
      await sendGuestNotification({
        type: 'CheckInWelcome',
        message: `Welcome to our hotel, ${guest.firstName}! You are now checked in to Room ${booking.Rooms?.[0]?.roomNumber}. Have a pleasant stay!`,
        recipient: guest.email || guest.phone,
        bookingId: booking.id,
        guestId: guest.id,
        hotelId: booking.hotelId,
        channel: guest.email ? 'Email' : 'SMS'
      });
    }

    res.status(200).json({ message: 'Checked in successfully', bookingId: id });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check out a booking (recalculates actual stay and final amount)
// @route   PATCH /api/bookings/:id/check-out
const checkOut = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: { id, hotelId },
      include: [{
        model: Room,
        through: { attributes: ['priceAtBooking'] }
      }],
      transaction: t
    });

    if (!booking) {
      await t.rollback();
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.status !== 'Checked In') {
      await t.rollback();
      return res.status(400).json({ message: 'Only checked-in bookings can be checked out' });
    }

    // ── Actual stay calculation ──────────────────────────────────────────────
    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);

    // Normalise to start-of-day boundaries so a same-day checkout = 1 night
    const msPerDay = 1000 * 60 * 60 * 24;
    const rawDiff = now - checkInDate;
    const actualNights = Math.max(1, Math.ceil(rawDiff / msPerDay));

    // Clamp to the originally booked nights (no extra charge for late checkout)
    const bookedNights = booking.bookedNights || calcNights(booking.checkInDate, booking.checkOutDate);
    const billedNights = Math.min(actualNights, bookedNights);

    // Recalculate total based on per-room priceAtBooking stored in the join table
    let accommodationTotal = booking.Rooms.reduce((sum, room) => {
      const totalAtBooking = parseFloat(room.BookingRoom?.priceAtBooking || 0);
      const nightlyRate = bookedNights > 0 ? totalAtBooking / bookedNights : totalAtBooking;
      return sum + (nightlyRate * billedNights);
    }, 0);

    // Fetch unpaid food orders charged to this room - ONLY inclusive if served (Completed)
    const foodOrders = await Order.findAll({
      where: {
        bookingId: id,
        paymentType: 'Charge to Room',
        status: 'Completed'
      },
      transaction: t
    });

    const foodTotal = foodOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
    const recalculatedTotal = accommodationTotal + foodTotal;
    // ────────────────────────────────────────────────────────────────────────

    const roomIds = booking.Rooms.map(r => r.id);

    await booking.update({
      status: 'Checked Out',
      actualCheckOutDate: now,
      actualNights: billedNights,
      totalAmount: recalculatedTotal
    }, { transaction: t });

    await Room.update(
      { status: 'Available' },
      { where: { id: { [Op.in]: roomIds } }, transaction: t }
    );

    await t.commit();

    await logActivity({
      action: 'CHECK_OUT',
      module: 'Booking',
      details: `Checked out booking ID ${id}. Final amount: ETB ${recalculatedTotal}`,
      userId: req.user?.id,
      hotelId,
      req
    });

    // Real-time update
    try {
      getIO().emit('bookingUpdate', { id: id, status: 'Checked Out' });
    } catch (err) { }

    // Automated Notification: Thank You / Check-Out
    const guest = await Guest.findByPk(booking.guestId);
    if (guest) {
      await sendGuestNotification({
        type: 'CheckOutThankYou',
        message: `Thank you for staying with us, ${guest.firstName}! We hope you had a wonderful time. Your final bill was ETB ${recalculatedTotal}. Safe travels!`,
        recipient: guest.email || guest.phone,
        bookingId: booking.id,
        guestId: guest.id,
        hotelId: booking.hotelId,
        channel: guest.email ? 'Email' : 'SMS'
      });
    }

    res.status(200).json({
      message: 'Checked out successfully',
      bookingId: id,
      actualNights: billedNights,
      originalNights: bookedNights,
      earlyCheckout: billedNights < bookedNights,
      finalAmount: recalculatedTotal
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: { id, hotelId },
      include: [{ model: Room, through: { attributes: [] } }],
      transaction: t
    });

    if (!booking) { await t.rollback(); return res.status(404).json({ message: 'Booking not found' }); }
    if (['Checked In', 'Checked Out', 'Cancelled'].includes(booking.status)) {
      await t.rollback();
      return res.status(400).json({ message: `Cannot cancel a booking that is currently ${booking.status}` });
    }

    const roomIds = booking.Rooms.map(r => r.id);
    await booking.update({ status: 'Cancelled' }, { transaction: t });
    await Room.update({ status: 'Available' }, { where: { id: { [Op.in]: roomIds } }, transaction: t });

    await t.commit();

    await logActivity({
      action: 'CANCEL_BOOKING',
      module: 'Booking',
      details: `Cancelled booking ID ${id}`,
      userId: req.user?.id,
      hotelId,
      req
    });

    // Real-time update
    try {
      getIO().emit('bookingUpdate', { id: id, status: 'Cancelled' });
    } catch (err) { }

    res.status(200).json({ message: 'Booking cancelled', bookingId: id });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking billing summary
// @route   GET /api/bookings/:id/summary
const getBookingSummary = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: { id, hotelId },
      include: [
        { 
          model: Room, 
          through: { model: BookingRoom, attributes: ['priceAtBooking'] },
          include: [{ model: RoomType }]
        },
        { model: Guest }
      ]
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Calculate nights
    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const rawDiff = now - checkInDate;
    const actualNights = Math.max(1, Math.ceil(rawDiff / msPerDay));
    const bookedNights = booking.bookedNights || Math.max(1, Math.ceil((new Date(booking.checkOutDate) - checkInDate) / msPerDay));
    
    // If checked out, use actual nights stored
    const billedNights = ['Checked Out'].includes(booking.status) 
      ? (booking.actualNights || bookedNights) 
      : Math.min(actualNights, bookedNights);

    const roomCharges = booking.Rooms.map(room => {
      const totalAtBooking = parseFloat(room.BookingRoom?.priceAtBooking || 0);
      const nightlyRate = bookedNights > 0 ? totalAtBooking / bookedNights : totalAtBooking;
      return {
        roomNumber: room.roomNumber,
        roomType: room.RoomType?.name,
        nightlyRate,
        billedNights,
        total: nightlyRate * billedNights
      };
    });

    const roomTotal = roomCharges.reduce((sum, item) => sum + item.total, 0);

    // Get food orders charged to room
    const foodOrders = await Order.findAll({
      where: { 
        bookingId: id,
        paymentType: 'Charge to Room',
        status: { [Op.notIn]: ['Cancelled'] }
      },
      include: [
        { 
          model: OrderItem, 
          include: [{ model: MenuItem, attributes: ['name', 'price'] }] 
        }
      ]
    });

    const servedOrders = foodOrders.filter(o => o.status === 'Completed');
    const foodTotal = servedOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    res.status(200).json({
      bookingId: id,
      guestName: `${booking.Guest?.firstName} ${booking.Guest?.lastName}`,
      status: booking.status,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      nights: billedNights,
      roomCharges,
      roomTotal,
      foodOrders: foodOrders.map(o => ({
        id: o.id,
        orderType: o.orderType,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
        items: o.OrderItems.map(oi => ({
          name: oi.MenuItem?.name,
          quantity: oi.quantity,
          price: oi.priceAtOrder || oi.MenuItem?.price
        }))
      })),
      foodTotal,
      grandTotal: roomTotal + foodTotal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getBookings, 
  createBooking, 
  updateBooking, 
  confirmBooking, 
  checkIn, 
  checkOut, 
  cancelBooking,
  getBookingSummary
};
