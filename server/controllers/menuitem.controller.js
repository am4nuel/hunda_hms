const { MenuItem, MenuCategory } = require('../models');

// @desc    Get all menu items for a hotel
// @route   GET /api/menu-items
const getMenuItems = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const items = await MenuItem.findAll({ 
      where: { hotelId },
      include: [{ model: MenuCategory, attributes: ['name'] }]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu-items
const createMenuItem = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { name, description, price, categoryId, availability, image } = req.body;

    const newItem = await MenuItem.create({
      name,
      description,
      price,
      categoryId,
      availability: availability !== undefined ? availability : true,
      image,
      hotelId
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu-items/:id
const updateMenuItem = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;
    const { name, description, price, categoryId, availability, image } = req.body;

    const item = await MenuItem.findOne({ where: { id, hotelId } });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await item.update({
      name,
      description,
      price,
      categoryId,
      availability,
      image
    });
    res.status(200).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu-items/:id
const deleteMenuItem = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;
    const item = await MenuItem.findOne({ where: { id, hotelId } });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await item.destroy();
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
