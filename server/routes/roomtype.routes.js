const express = require('express');
const router = express.Router();
const { 
  getRoomTypes, 
  createRoomType, 
  updateRoomType, 
  deleteRoomType 
} = require('../controllers/roomtype.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.get('/', authMiddleware, getRoomTypes);
router.post('/', authMiddleware, createRoomType);
router.put('/:id', authMiddleware, updateRoomType);
router.delete('/:id', authMiddleware, deleteRoomType);

module.exports = router;
