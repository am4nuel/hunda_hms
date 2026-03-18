const { TableReservation, DiningTable } = require('../models');
const { getIO } = require('../utils/socket');

// @desc    Get all table reservations for a hotel
// @route   GET /api/table-reservations
const getReservations = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    
    const where = { hotelId };
    if (req.query.userId) where.userId = req.query.userId;
    
    const reservations = await TableReservation.findAll({ 
      where,
      include: [{ model: DiningTable }],
      order: [['reservationTime', 'DESC']]
    });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new table reservation
// @route   POST /api/table-reservations
const createReservation = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.body.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    
    const { guestName, guestPhone, guestEmail, reservationTime, numberOfGuests, notes, diningTableId, userId } = req.body;
    
    if (reservationTime) {
      const now = new Date();
      if (new Date(reservationTime) < now) {
        return res.status(400).json({ message: "Reservation time cannot be in the past" });
      }
    }

    const reservation = await TableReservation.create({
      guestName,
      guestPhone,
      guestEmail,
      reservationTime,
      numberOfGuests,
      notes,
      hotelId,
      diningTableId,
      userId
    });

    // Fetch full reservation with dining table for the dashboard
    const fullReservation = await TableReservation.findByPk(reservation.id, {
      include: [{ model: DiningTable }]
    });

    // Notify dashboard via socket
    getIO().emit('newTableReservation', fullReservation);

    res.status(201).json(fullReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a table reservation
// @route   PUT /api/table-reservations/:id
const updateReservation = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId;
    const { id } = req.params;
    const updateData = req.body;

    const reservation = await TableReservation.findOne({ where: { id, hotelId } });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    await reservation.update(updateData);
    res.status(200).json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update reservation status
// @route   PATCH /api/table-reservations/:id/status
const updateStatus = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId;
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await TableReservation.findOne({ where: { id, hotelId } });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    await reservation.update({ status });

    // Emit real-time update
    getIO().emit('tableReservationStatusUpdate', { 
      id: reservation.id, 
      status, 
      userId: reservation.userId 
    });

    res.status(200).json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a reservation
// @route   DELETE /api/table-reservations/:id
const deleteReservation = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId;
    const { id } = req.params;

    const reservation = await TableReservation.findOne({ where: { id, hotelId } });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    await reservation.destroy();
    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReservations,
  createReservation,
  updateReservation,
  updateStatus,
  deleteReservation
};
