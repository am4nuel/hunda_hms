const { HotelAdmin, Hotel } = require('../models');
const bcrypt = require('bcryptjs');

const getAllHotelAdmins = async (req, res) => {
  try {
    const admins = await HotelAdmin.findAll({
      include: [{ model: Hotel, attributes: ['name'] }]
    });
    res.status(200).json(admins);
  } catch (error) {
    console.error('Fetch hotel admins error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createHotelAdmin = async (req, res) => {
  try {
    const { password, email, userName, ...rest } = req.body;

    // Build the query conditions dynamically to avoid "undefined" values
    const queryConditions = [];
    if (email) queryConditions.push({ email });
    if (userName) queryConditions.push({ userName });

    if (queryConditions.length > 0) {
      const existingAdmin = await HotelAdmin.findOne({
        where: {
          [require('sequelize').Op.or]: queryConditions
        }
      });

      if (existingAdmin) {
        return res.status(400).json({ 
          message: existingAdmin.email === email ? 'Email already in use' : 'Username already in use' 
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await HotelAdmin.create({ 
      ...rest, 
      email, 
      userName, 
      password: hashedPassword 
    });
    res.status(201).json(admin);
  } catch (error) {
    console.error('Create hotel admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateHotelAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...rest } = req.body;
    
    let updateData = { ...rest };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const [updated] = await HotelAdmin.update(updateData, { where: { id } });
    if (updated) {
      const updatedAdmin = await HotelAdmin.findByPk(id);
      return res.status(200).json(updatedAdmin);
    }
    throw new Error('Hotel Admin not found');
  } catch (error) {
    console.error('Update hotel admin error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const deleteHotelAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HotelAdmin.destroy({ where: { id } });
    if (deleted) {
      return res.status(204).send();
    }
    throw new Error('Hotel Admin not found');
  } catch (error) {
    console.error('Delete hotel admin error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  getAllHotelAdmins,
  createHotelAdmin,
  updateHotelAdmin,
  deleteHotelAdmin
};
