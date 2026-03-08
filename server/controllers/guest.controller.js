const { Guest, Booking, Room } = require('../models');
const { Op } = require('sequelize');
const { normalizePhone } = require('../utils/phone');

// @desc    Get all guests for a hotel
// @route   GET /api/guests
const getGuests = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const guests = await Guest.findAll({
      where: { hotelId },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(guests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get profile by userId (for website)
// @route   GET /api/guests/profile
const getProfileByUserId = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { userId, email } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    let guest = await Guest.findOne({
      where: { userId, hotelId }
    });

    // Fallback: If not found by userId, but email provided, try email and update userId
    // This allows existing guests (from before userId field) to claim their profile
    if (!guest && email) {
      guest = await Guest.findOne({ where: { email, hotelId, userId: { [Op.is]: null } } });
      if (guest) {
        await guest.update({ userId });
        console.log(`Guest ${guest.id} claimed by userId ${userId}`);
      }
    }

    if (!guest) {
      return res.status(200).json(null);
    }

    res.status(200).json(guest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single guest with booking history
// @route   GET /api/guests/:id
const getGuest = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { id } = req.params;
    
    // Check if guest belongs to hotel
    const guest = await Guest.findOne({
      where: { id, hotelId },
      include: [{
        model: Booking,
        include: [Room]
      }],
      order: [[Booking, 'checkInDate', 'DESC']]
    });

    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.status(200).json(guest);
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({ message: error.message });
  }
};



// @desc    Create a new guest
// @route   POST /api/guests
const createGuest = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { firstName, lastName, email, phone, idType, idNumber, idFront, idBack, notes, userId } = req.body;
    const normalizedPhone = normalizePhone(phone);

    // Try to find existing guest by email OR phone and hotelId (Upsert)
    let guest;
    if (email || phone) {
      guest = await Guest.findOne({ 
        where: { 
          hotelId,
          [Op.or]: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone: normalizedPhone }] : [])
          ]
        } 
      });
    }

    if (guest) {
      // Preserve existing userId if they already have one, to link their history
      const finalUserId = guest.userId || userId;
      await guest.update({
        firstName, lastName, phone: normalizedPhone, idType, idNumber, idFront, idBack, notes, userId: finalUserId
      });
    } else {
      guest = await Guest.create({
        firstName, lastName, email, phone: normalizedPhone, idType, idNumber, idFront, idBack, notes, hotelId, userId
      });
    }

    res.status(201).json(guest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a guest
// @route   PUT /api/guests/:id
const updateGuest = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { id } = req.params;
    const guest = await Guest.findOne({ where: { id, hotelId } });
    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    const updateData = { ...req.body };
    if (updateData.phone) {
      updateData.phone = normalizePhone(updateData.phone);
    }

    await guest.update(updateData);
    res.status(200).json(guest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a guest
// @route   DELETE /api/guests/:id
const deleteGuest = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { id } = req.params;
    const guest = await Guest.findOne({ where: { id, hotelId } });
    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    await guest.destroy();
    res.status(200).json({ message: 'Guest removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGuests, getGuest, getProfileByUserId, createGuest, updateGuest, deleteGuest };
