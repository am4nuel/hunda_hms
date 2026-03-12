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

// Public route for website reservations
router.post('/public', reservationController.createReservation);

// Protected routes for dashboard
router.use(authMiddleware);

router.route('/')
  .get(reservationController.getReservations)
  .post(reservationController.createReservation);

router.route('/:id')
  .put(reservationController.updateReservation)
  .delete(reservationController.deleteReservation);

router.patch('/:id/status', reservationController.updateStatus);

module.exports = router;
