const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuitem.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.get('/', authMiddleware, menuItemController.getMenuItems);
router.post('/', authMiddleware, menuItemController.createMenuItem);
router.put('/:id', authMiddleware, menuItemController.updateMenuItem);
router.delete('/:id', authMiddleware, menuItemController.deleteMenuItem);

module.exports = router;
