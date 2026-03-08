const { Hotel, HotelAdmin, Theme } = require('../models');

const crypto = require('crypto');

const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.findAll({
      include: [
        { model: HotelAdmin },
        { model: Theme }
      ]
    });
    res.status(200).json(hotels);
  } catch (error) {
    console.error('Fetch hotels error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createHotel = async (req, res) => {
  try {
    const hotelData = { ...req.body };
    if (!hotelData.apiKey) {
      hotelData.apiKey = `hk_${crypto.randomBytes(24).toString('hex')}`;
    }
    if (!hotelData.allowedUrls) {
      hotelData.allowedUrls = JSON.stringify([]);
    }
    const hotel = await Hotel.create(hotelData);
    res.status(201).json(hotel);
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMyHotel = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID not specified' });
    
    const hotel = await Hotel.findByPk(hotelId, {
      include: [
        { model: Theme }
      ]
    });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.status(200).json(hotel);
  } catch (error) {
    console.error('Fetch my hotel error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelData = { ...req.body };
    
    // Ensure allowedUrls is stringified if it's an array
    if (hotelData.allowedUrls && Array.isArray(hotelData.allowedUrls)) {
      hotelData.allowedUrls = JSON.stringify(hotelData.allowedUrls);
    }

    const [updated] = await Hotel.update(hotelData, { where: { id } });
    if (updated) {
      const updatedHotel = await Hotel.findByPk(id);
      return res.status(200).json(updatedHotel);
    }
    throw new Error('Hotel not found');
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Hotel.destroy({ where: { id } });
    if (deleted) {
      return res.status(204).send();
    }
    throw new Error('Hotel not found');
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  getAllHotels,
  getMyHotel,
  createHotel,
  updateHotel,
  deleteHotel
};
