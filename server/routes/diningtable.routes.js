const express = require('express');
const router = express.Router();
const tableController = require('../controllers/diningtable.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

router.get('/', authMiddleware, tableController.getTables);
router.post('/', authMiddleware, tableController.createTable);
router.put('/:id', authMiddleware, tableController.updateTable);
router.delete('/:id', authMiddleware, tableController.deleteTable);

module.exports = router;
