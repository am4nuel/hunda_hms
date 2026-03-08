const { Unit, Sequelize } = require('../models');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all units for a hotel
// @route   GET /api/units
exports.getAllUnits = async (req, res) => {
  try {
    const { hotelId } = req.query;
    
    // Fetch units that are either global (hotelId is null) or specific to this hotel
    const units = await Unit.findAll({
      where: {
        [Sequelize.Op.or]: [
          { hotelId: null },
          { hotelId: hotelId || null }
        ]
      },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new unit
// @route   POST /api/units
exports.createUnit = async (req, res) => {
  try {
    const unit = await Unit.create(req.body);
    await logActivity({
      action: 'CREATE_UNIT',
      module: 'Inventory',
      details: `Created unit: ${unit.name}`,
      userId: req.user?.id || req.body.userId,
      hotelId: unit.hotelId,
      req
    });
    res.status(201).json(unit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a unit
// @route   PUT /api/units/:id
exports.updateUnit = async (req, res) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    await unit.update(req.body);
    await logActivity({
      action: 'UPDATE_UNIT',
      module: 'Inventory',
      details: `Updated unit: ${unit.name}`,
      userId: req.user?.id || req.body.userId,
      hotelId: unit.hotelId,
      req
    });
    res.json(unit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a unit
// @route   DELETE /api/units/:id
exports.deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findByPk(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    const unitName = unit.name;
    const hId = unit.hotelId;
    await unit.destroy();
    
    await logActivity({
      action: 'DELETE_UNIT',
      module: 'Inventory',
      details: `Deleted unit: ${unitName}`,
      userId: req.user?.id,
      hotelId: hId,
      req
    });
    res.json({ message: 'Unit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
