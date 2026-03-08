const { Bank } = require('../models');

exports.createBank = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const bank = await Bank.create({ ...req.body, hotelId });
    res.status(201).json(bank);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllBanks = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    
    const where = { hotelId, active: true };
    
    // If it's a dashboard request (has req.user), we might want to see inactive ones too
    if (req.user) {
      delete where.active;
    }

    const banks = await Bank.findAll({ where });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBank = async (req, res) => {
  try {
    const bank = await Bank.findByPk(req.params.id);
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    await bank.update(req.body);
    res.json(bank);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBank = async (req, res) => {
  try {
    const bank = await Bank.findByPk(req.params.id);
    if (!bank) return res.status(404).json({ message: 'Bank not found' });
    await bank.destroy();
    res.json({ message: 'Bank deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
