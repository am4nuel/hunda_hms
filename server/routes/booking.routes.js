const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const {
  getBookings,
  createBooking,
  updateBooking,
  confirmBooking,
  checkIn,
  checkOut,
  cancelBooking,
  getBookingSummary
} = require('../controllers/booking.controller');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.get('/', authMiddleware, getBookings);
router.post('/', authMiddleware, createBooking);
router.put('/:id', authMiddleware, updateBooking);
router.patch('/:id/confirm', authMiddleware, confirmBooking);
router.patch('/:id/check-in', authMiddleware, checkIn);
router.patch('/:id/check-out', authMiddleware, checkOut);
router.get('/:id/summary', authMiddleware, getBookingSummary);
router.patch('/:id/cancel', authMiddleware, cancelBooking);

module.exports = router;
