const { SystemAdmin, HotelAdmin, SystemUser } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const crypto = require('crypto');

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Check SystemAdmin
    let user = await SystemAdmin.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { userName: identifier }
        ]
      }
    });

    let role = 'admin';
    let authenticatedUser = null;

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        authenticatedUser = user;
      }
    }

    // If not authenticated as SystemAdmin, check HotelAdmin
    if (!authenticatedUser) {
      user = await HotelAdmin.findOne({
        where: {
          [Op.or]: [
            { email: identifier },
            { userName: identifier }
          ]
        },
        include: [{ model: require('../models').Hotel }]
      });

      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
          authenticatedUser = user;
          role = 'hotel_admin';
        }
      }
    }

    // If not authenticated, check SystemUser (Staff/Managers)
    if (!authenticatedUser) {
      user = await SystemUser.findOne({
        where: {
          [Op.or]: [
            { email: identifier },
            { userName: identifier }
          ]
        },
        include: [{ model: require('../models').Hotel }]
      });

      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
          authenticatedUser = user;
          role = user.role; // Use specific role (receptionist, kitchen_staff, etc.)
        }
      }
    }

    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: authenticatedUser.id, 
        role: role, 
        userName: authenticatedUser.userName || authenticatedUser.email,
        hotelId: authenticatedUser.hotelId || null
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: authenticatedUser.id,
        firstName: authenticatedUser.firstName,
        lastName: authenticatedUser.lastName,
        userName: authenticatedUser.userName || authenticatedUser.email,
        email: authenticatedUser.email,
        role: role,
        hotelId: authenticatedUser.hotelId || null,
        hotelName: authenticatedUser.Hotel?.name || null,
        profilePicture: authenticatedUser.profilePicture,
        allowedModules: authenticatedUser.allowedModules || null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Search in all user tables
    let user = await HotelAdmin.findOne({ where: { email } }) || 
               await SystemUser.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email address" });
    }

    const token = crypto.randomBytes(20).toString('hex');
    await user.update({
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000 // 1 hour
    });

    // In a real app, send an email here. For now, return the token for testing/demo.
    res.json({ 
      message: "Reset token generated. Usually this would be sent via email.",
      token: token // REMOVE in production
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    let user = await HotelAdmin.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    }) || await SystemUser.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }

    // Update password (hooks in SystemUser will handle hashing if it's SystemUser)
    // For HotelAdmin, we might need manual hashing if no hook exists
    if (user.constructor.name === 'HotelAdmin') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    } else {
      user.password = newPassword; // SystemUser hook handles it
    }

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    let user;
    if (userRole === 'admin') {
      user = await SystemAdmin.findByPk(userId);
    } else if (userRole === 'hotel_admin') {
      user = await HotelAdmin.findByPk(userId);
    } else {
      user = await SystemUser.findByPk(userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    if (user.constructor.name === 'SystemUser') {
      user.password = newPassword; // SystemUser has hook 
    } else {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { login, forgotPassword, resetPassword, changePassword };
