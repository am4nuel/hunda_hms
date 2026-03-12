const { Room, RoomType, Booking, BookingRoom, Hotel } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all rooms for a hotel (supports date availability filtering)
// @route   GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });

    const hotel = await Hotel.findByPk(hotelId);
    const pendingDuration = hotel?.pendingReservationDuration || 60;
    const expiryTime = new Date(Date.now() - pendingDuration * 60 * 1000);

    const { startDate, endDate } = req.query;
    let reservedRoomIds = [];

    // If dates are provided, identify rooms with overlapping bookings
    if (startDate && endDate) {
      const overlappingBookings = await Booking.findAll({
        where: {
          hotelId,
          [Op.or]: [
            { status: { [Op.in]: ['Confirmed', 'Checked In'] } },
            {
              [Op.and]: [
                { status: 'Pending' },
                { createdAt: { [Op.gt]: expiryTime } }
              ]
            }
          ],
          checkInDate: { [Op.lt]: endDate },
          checkOutDate: { [Op.gt]: startDate }
        },
        include: [{ model: Room, attributes: ['id'] }]
      });

      overlappingBookings.forEach(booking => {
        if (booking.Rooms) {
          booking.Rooms.forEach(room => reservedRoomIds.push(room.id));
        }
      });
    }

    const rooms = await Room.findAll({ 
      where: { hotelId },
      include: [{ model: RoomType, attributes: ['name', 'basePrice', 'capacity'] }]
    });

    // Map rooms to include availability status
    const roomsWithStatus = rooms.map(room => {
      const roomJson = room.toJSON();
      return {
        ...roomJson,
        isReserved: reservedRoomIds.includes(room.id)
      };
    });

    res.status(200).json(roomsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
const createRoom = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { roomNumber, roomTypeId, status, images } = req.body;

    // Check if room number already exists for this hotel
    const existingRoom = await Room.findOne({ where: { roomNumber, hotelId } });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const newRoom = await Room.create({
      roomNumber,
      roomTypeId,
      status: status || 'Available',
      images: images || [],
      hotelId
    });

    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
const updateRoom = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { id } = req.params;
    const { roomNumber, roomTypeId, status, images } = req.body;
    const room = await Room.findOne({ where: { id, hotelId } });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.update({
      roomNumber,
      roomTypeId,
      status,
      images: images || room.images
    });
    res.status(200).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update room status
// @route   PATCH /api/rooms/:id/status
const updateRoomStatus = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Available', 'Booked', 'Occupied', 'Under maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const room = await Room.findOne({ where: { id, hotelId } });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.status = status;
    await room.save();

    res.status(200).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
const deleteRoom = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { id } = req.params;
    const room = await Room.findOne({ where: { id, hotelId } });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Optional: Check if room is occupied before deleting
    if (room.status === 'Occupied') {
      return res.status(400).json({ message: 'Cannot delete an occupied room' });
    }

    await room.destroy();
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Duplicate a room
// @route   POST /api/rooms/:id/duplicate
const duplicateRoom = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { id } = req.params;
    const { roomNumbers } = req.body; // Expecting an array of strings

    if (!Array.isArray(roomNumbers) || roomNumbers.length === 0) {
      return res.status(400).json({ message: 'Room numbers are required as an array' });
    }

    const sourceRoom = await Room.findOne({ where: { id, hotelId } });
    if (!sourceRoom) {
      return res.status(404).json({ message: 'Source room not found' });
    }

    // Check for existing room numbers first
    const existingRooms = await Room.findAll({
      where: {
        hotelId,
        roomNumber: roomNumbers
      }
    });

    if (existingRooms.length > 0) {
      const existingStr = existingRooms.map(r => r.roomNumber).join(', ');
      return res.status(400).json({ message: `Room numbers already exist: ${existingStr}` });
    }

    // Create the new rooms
    const newRoomsData = roomNumbers.map(number => ({
      roomNumber: number,
      roomTypeId: sourceRoom.roomTypeId,
      status: sourceRoom.status,
      images: sourceRoom.images,
      hotelId
    }));

    const newRooms = await Room.bulkCreate(newRoomsData);

    res.status(201).json(newRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get occupied dates for a room
// @route   GET /api/rooms/:id/occupied-dates
const getRoomOccupiedDates = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;

    const hotel = await Hotel.findByPk(hotelId);
    const pendingDuration = hotel?.pendingReservationDuration || 60;
    const expiryTime = new Date(Date.now() - pendingDuration * 60 * 1000);

    const bookings = await Booking.findAll({
      where: {
        hotelId,
        [Op.or]: [
          { status: { [Op.in]: ['Confirmed', 'Checked In'] } },
          {
            [Op.and]: [
              { status: 'Pending' },
              { createdAt: { [Op.gt]: expiryTime } }
            ]
          }
        ]
      },
      include: [{
        model: Room,
        where: { id },
        attributes: []
      }],
      attributes: ['checkInDate', 'checkOutDate']
    });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRooms,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  duplicateRoom,
  getRoomOccupiedDates
};
