const { Attendance, Staff } = require('../models');

const getAttendance = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    
    const { date, staffId } = req.query;
    const where = { hotelId };
    if (date) where.date = date;
    if (staffId) where.staffId = staffId;

    const reports = await Attendance.findAll({
      where,
      include: [{ model: Staff, attributes: ['firstName', 'lastName', 'position'] }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { staffId, date, status, checkIn, checkOut, notes } = req.body;

    const [attendance, created] = await Attendance.findOrCreate({
      where: { staffId, date, hotelId },
      defaults: { status, checkIn, checkOut, notes }
    });

    if (!created) {
      await attendance.update({ status, checkIn, checkOut, notes });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAttendance,
  markAttendance
};
