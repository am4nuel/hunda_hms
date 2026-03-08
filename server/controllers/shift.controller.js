const { Shift, Staff } = require('../models');

const getShifts = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    
    const { date, status } = req.query;
    const where = { hotelId };
    if (date) where.date = date;
    if (status) where.status = status;

    const shifts = await Shift.findAll({
      where,
      include: [{ model: Staff, attributes: ['firstName', 'lastName', 'position'] }],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createShift = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const shift = await Shift.create({ ...req.body, hotelId });
    res.status(201).json(shift);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateShiftStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const shift = await Shift.findOne({ where: { id, hotelId } });
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    await shift.update({ status });
    res.status(200).json(shift);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getShifts,
  createShift,
  updateShiftStatus
};
