const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/tablereservation.controller');
const { protect } = require('../middleware/auth.middleware');

// Public route for website reservations
router.post('/public', reservationController.createReservation);

// Protected routes for dashboard
router.use(protect);

router.route('/')
  .get(reservationController.getReservations)
  .post(reservationController.createReservation);

router.route('/:id')
  .put(reservationController.updateReservation)
  .delete(reservationController.deleteReservation);

router.patch('/:id/status', reservationController.updateStatus);

module.exports = router;
