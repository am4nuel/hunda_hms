const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { getGuests, getGuest, getProfileByUserId, createGuest, updateGuest, deleteGuest } = require('../controllers/guest.controller');

const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.get('/profile', authMiddleware, getProfileByUserId);
router.get('/', authMiddleware, getGuests);
router.get('/:id', authMiddleware, getGuest);
router.post('/', authMiddleware, createGuest);
router.put('/:id', authMiddleware, updateGuest);
router.delete('/:id', authMiddleware, deleteGuest);

module.exports = router;
