const { RoomType, Room } = require('../models');

// @desc    Get all room types for a hotel
// @route   GET /api/room-types
const getRoomTypes = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const roomTypes = await RoomType.findAll({ 
      where: { hotelId },
      include: [{ model: Room, as: 'Rooms' }]
    });
    res.status(200).json(roomTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new room type
// @route   POST /api/room-types
const createRoomType = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { name, description, basePrice, capacity, amenities, images } = req.body;

    const newRoomType = await RoomType.create({
      name,
      description,
      basePrice,
      capacity,
      amenities: amenities || [],
      images: images || [],
      hotelId
    });

    res.status(201).json(newRoomType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a room type
// @route   PUT /api/room-types/:id
const updateRoomType = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;
    const roomType = await RoomType.findOne({ where: { id, hotelId } });

    if (!roomType) {
      return res.status(404).json({ message: 'Room type not found' });
    }

    await roomType.update(req.body);
    res.status(200).json(roomType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a room type
// @route   DELETE /api/room-types/:id
const deleteRoomType = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;
    const roomType = await RoomType.findOne({ where: { id, hotelId } });

    if (!roomType) {
      return res.status(404).json({ message: 'Room type not found' });
    }

    // Check if there are rooms associated with this room type
    const associatedRooms = await Room.count({ where: { roomTypeId: id } });
    if (associatedRooms > 0) {
      return res.status(400).json({ message: 'Cannot delete room type with associated rooms. Delete or reassign rooms first.' });
    }

    await roomType.destroy();
    res.status(200).json({ message: 'Room type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType
};
