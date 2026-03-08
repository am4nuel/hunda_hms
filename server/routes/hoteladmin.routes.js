const express = require('express');
const router = express.Router();
const hotelAdminController = require('../controllers/hoteladmin.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.get('/', verifyToken, isAdmin, hotelAdminController.getAllHotelAdmins);
router.post('/', verifyToken, isAdmin, hotelAdminController.createHotelAdmin);
router.put('/:id', verifyToken, isAdmin, hotelAdminController.updateHotelAdmin);
router.delete('/:id', verifyToken, isAdmin, hotelAdminController.deleteHotelAdmin);

module.exports = router;
