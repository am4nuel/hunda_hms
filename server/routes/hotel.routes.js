const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

// Publicly accessible via API Key OR Protected via JWT Token (for hotel owners/admins)
router.get('/my-hotel', authMiddleware, hotelController.getMyHotel);

// System Admin Only Routes
router.get('/', verifyToken, isAdmin, hotelController.getAllHotels);
router.post('/', verifyToken, isAdmin, hotelController.createHotel);
router.put('/:id', verifyToken, isAdmin, hotelController.updateHotel);
router.delete('/:id', verifyToken, isAdmin, hotelController.deleteHotel);

module.exports = router;
