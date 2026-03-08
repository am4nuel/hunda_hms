const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const attendanceController = require('../controllers/attendance.controller');
const shiftController = require('../controllers/shift.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

// Staff Profile Routes
router.get('/', authMiddleware, staffController.getStaff);
router.post('/', authMiddleware, staffController.createStaff);
router.put('/:id', authMiddleware, staffController.updateStaff);
router.delete('/:id', authMiddleware, staffController.deleteStaff);

// Attendance Routes
router.get('/attendance', authMiddleware, attendanceController.getAttendance);
router.post('/attendance', authMiddleware, attendanceController.markAttendance);

// Shift Routes
router.get('/shifts', authMiddleware, shiftController.getShifts);
router.post('/shifts', authMiddleware, shiftController.createShift);
router.put('/shifts/:id/status', authMiddleware, shiftController.updateShiftStatus);

module.exports = router;
