const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.get('/occupancy', authMiddleware, reportController.getRoomOccupancy);
router.get('/sales', authMiddleware, reportController.getSalesSummary);
router.get('/popular-items', authMiddleware, reportController.getPopularItems);
router.get('/revenue', authMiddleware, reportController.getRevenueSummary);
router.get('/trend', authMiddleware, reportController.getRevenueTrend);
router.get('/category-sales', authMiddleware, reportController.getCategorySalesReport);

module.exports = router;
