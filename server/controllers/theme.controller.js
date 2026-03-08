const { Theme } = require('../models');

const getAllThemes = async (req, res) => {
  try {
    const whereClause = req.hotelId ? { hotelId: req.hotelId } : {};
    const themes = await Theme.findAll({ where: whereClause });
    res.status(200).json(themes);
  } catch (error) {
    console.error('Fetch themes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createTheme = async (req, res) => {
  try {
    const theme = await Theme.create(req.body);
    res.status(201).json(theme);
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Theme.update(req.body, { where: { id } });
    if (updated) {
      const updatedTheme = await Theme.findByPk(id);
      return res.status(200).json(updatedTheme);
    }
    throw new Error('Theme not found');
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Theme.destroy({ where: { id } });
    if (deleted) {
      return res.status(204).send();
    }
    throw new Error('Theme not found');
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  getAllThemes,
  createTheme,
  updateTheme,
  deleteTheme
};
