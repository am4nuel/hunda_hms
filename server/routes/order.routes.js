const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.get('/', authMiddleware, orderController.getOrders);
router.post('/', authMiddleware, orderController.createOrder);
router.patch('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.delete('/:id', authMiddleware, orderController.cancelOrder);

module.exports = router;
