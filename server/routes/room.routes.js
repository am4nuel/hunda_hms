const express = require('express');
const router = express.Router();
const { 
  getRooms, 
  createRoom, 
  updateRoom, 
  updateRoomStatus, 
  deleteRoom,
  duplicateRoom,
  getRoomOccupiedDates
} = require('../controllers/room.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.get('/', authMiddleware, getRooms);
router.post('/', authMiddleware, createRoom);
router.post('/:id/duplicate', authMiddleware, duplicateRoom);
router.put('/:id', authMiddleware, updateRoom);
router.get('/:id/occupied-dates', authMiddleware, getRoomOccupiedDates);
router.patch('/:id/status', authMiddleware, updateRoomStatus);
router.delete('/:id', authMiddleware, deleteRoom);

module.exports = router;
