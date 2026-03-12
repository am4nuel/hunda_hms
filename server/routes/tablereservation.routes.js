const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/tablereservation.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

console.log('Loading Table Reservation Routes...');
console.log('reservationController:', typeof reservationController);
console.log('authMiddleware:', typeof authMiddleware);
console.log('getReservations:', typeof reservationController?.getReservations);

// Public route for website reservations
router.post('/public', reservationController.createReservation);

// Protected routes for dashboard
router.get('/', authMiddleware, reservationController.getReservations);
router.post('/', authMiddleware, reservationController.createReservation);
router.put('/:id', authMiddleware, reservationController.updateReservation);
router.patch('/:id/status', authMiddleware, reservationController.updateStatus);
router.delete('/:id', authMiddleware, reservationController.deleteReservation);

module.exports = router;
