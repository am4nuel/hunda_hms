const { MenuCategory } = require('../models');

// @desc    Get all menu categories for a hotel
// @route   GET /api/menu-categories
const getCategories = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const categories = await MenuCategory.findAll({ 
      where: { hotelId }
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new menu category
// @route   POST /api/menu-categories
const createCategory = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { name, description } = req.body;

    const newCategory = await MenuCategory.create({
      name,
      description,
      hotelId
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a menu category
// @route   PUT /api/menu-categories/:id
const updateCategory = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await MenuCategory.findOne({ where: { id, hotelId } });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.update({ name, description });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a menu category
// @route   DELETE /api/menu-categories/:id
const deleteCategory = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;
    const category = await MenuCategory.findOne({ where: { id, hotelId } });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
