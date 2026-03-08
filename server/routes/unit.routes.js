const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unit.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, unitController.getAllUnits);
router.post('/', verifyToken, unitController.createUnit);
router.put('/:id', verifyToken, unitController.updateUnit);
router.delete('/:id', verifyToken, unitController.deleteUnit);

module.exports = router;
