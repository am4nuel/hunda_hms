const { Hotel } = require('../models');

const validateApiKey = async (req, res, next) => {
  const apiKey = req.header('X-API-KEY');

  if (!apiKey) {
    return res.status(401).json({ message: 'API Key is missing' });
  }

  // Check for global public API key
  if (process.env.PUBLIC_API_KEY && apiKey === process.env.PUBLIC_API_KEY) {
    return next();
  }

  try {
    const hotel = await Hotel.findOne({ where: { apiKey, active: true } });

    if (!hotel) {
      return res.status(403).json({ message: 'Invalid or inactive API Key' });
    }

    // Attach hotel info to request
    req.hotelId = hotel.id;
    req.hotel = hotel;

    next();
  } catch (error) {
    console.error('API Key validation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { validateApiKey };
