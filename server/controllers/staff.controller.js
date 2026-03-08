const { Staff, SystemUser, Hotel } = require('../models');

const getStaff = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const staff = await Staff.findAll({
      where: { hotelId },
      include: [
        { model: SystemUser, as: 'User', attributes: ['id', 'userName', 'role', 'status'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const staff = await Staff.create({ ...req.body, hotelId });
    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const staff = await Staff.findOne({ where: { id, hotelId } });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    await staff.update(req.body);
    res.status(200).json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const staff = await Staff.findOne({ where: { id, hotelId } });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    // If linked to a user, null out the staffId in SystemUser
    if (staff.systemUserId) {
      await SystemUser.update({ staffId: null }, { where: { id: staff.systemUserId } });
    }

    await staff.destroy();
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff
};
