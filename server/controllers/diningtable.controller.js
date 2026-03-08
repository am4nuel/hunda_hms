const { DiningTable } = require('../models');

// @desc    Get all tables for a hotel
// @route   GET /api/dining-tables
const getTables = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const tables = await DiningTable.findAll({ where: { hotelId } });
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new table
// @route   POST /api/dining-tables
const createTable = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { number, capacity } = req.body;

    const existingTable = await DiningTable.findOne({ where: { number, hotelId } });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    const table = await DiningTable.create({
      number,
      capacity,
      hotelId
    });

    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a table
// @route   PUT /api/dining-tables/:id
const updateTable = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;
    const { number, capacity, status } = req.body;

    const table = await DiningTable.findOne({ where: { id, hotelId } });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    if (number && number !== table.number) {
        const existingTable = await DiningTable.findOne({ where: { number, hotelId } });
        if (existingTable) {
          return res.status(400).json({ message: 'Table number already exists' });
        }
    }

    await table.update({ number, capacity, status });
    res.status(200).json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a table
// @route   DELETE /api/dining-tables/:id
const deleteTable = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;

    const table = await DiningTable.findOne({ where: { id, hotelId } });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await table.destroy();
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTables,
  createTable,
  updateTable,
  deleteTable
};
