const { SystemUser } = require('../models');

// @desc    Get all system users for a hotel
// @route   GET /api/system-users
const getSystemUsers = async (req, res) => {
  try {
    const hotelId = req.user.hotelId;
    const users = await SystemUser.findAll({ 
      where: { hotelId },
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new system user
// @route   POST /api/system-users
const createSystemUser = async (req, res) => {
  try {
    const hotelId = req.user.hotelId;
    const { firstName, lastName, userName, email, phoneNumber, password, role, status, allowedModules } = req.body;

    // Check if username already exists for this hotel
    const existingUser = await SystemUser.findOne({ where: { userName, hotelId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists for this hotel (only if email is provided)
    if (email) {
      const existingEmail = await SystemUser.findOne({ where: { email, hotelId } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const newUser = await SystemUser.create({
      firstName,
      lastName,
      userName,
      email: email || null,
      phoneNumber: phoneNumber || null,
      password,
      role: role || 'hotel_manager',
      status: status || 'Active',
      allowedModules: allowedModules || null,
      hotelId
    });

    // Don't return password
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a system user
// @route   PUT /api/system-users/:id
const updateSystemUser = async (req, res) => {
  try {
    const hotelId = req.user.hotelId;
    const { id } = req.params;
    const { firstName, lastName, userName, email, phoneNumber, password, role, status, allowedModules } = req.body;

    const user = await SystemUser.findOne({ where: { id, hotelId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (userName) user.userName = userName;
    if (email !== undefined) user.email = email || null;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber || null;
    if (password) user.password = password;
    if (role) user.role = role;
    if (status) user.status = status;
    if (allowedModules !== undefined) user.allowedModules = allowedModules;

    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a system user
// @route   DELETE /api/system-users/:id
const deleteSystemUser = async (req, res) => {
  try {
    const hotelId = req.user.hotelId;
    const { id } = req.params;
    const user = await SystemUser.findOne({ where: { id, hotelId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSystemUsers,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser
};
