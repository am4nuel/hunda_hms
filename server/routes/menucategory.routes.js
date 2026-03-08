const express = require('express');
const router = express.Router();
const menuCategoryController = require('../controllers/menucategory.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.get('/', authMiddleware, menuCategoryController.getCategories);
router.post('/', authMiddleware, menuCategoryController.createCategory);
router.put('/:id', authMiddleware, menuCategoryController.updateCategory);
router.delete('/:id', authMiddleware, menuCategoryController.deleteCategory);

module.exports = router;
