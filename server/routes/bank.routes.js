const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bank.controller');

const { verifyToken, isHotelAdmin } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.post('/', authMiddleware, isHotelAdmin, bankController.createBank);
router.get('/', authMiddleware, bankController.getAllBanks); // No isHotelAdmin for GET to allow public fetch
router.put('/:id', authMiddleware, isHotelAdmin, bankController.updateBank);
router.delete('/:id', authMiddleware, isHotelAdmin, bankController.deleteBank);

module.exports = router;
