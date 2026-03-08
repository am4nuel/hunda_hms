'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class SystemUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SystemUser.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      SystemUser.belongsTo(models.Staff, { foreignKey: 'staffId', as: 'StaffProfile' });
    }

    // Helper method to validate password
    async comparePassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }
  SystemUser.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'hotel_manager' // Possible roles: admin, hotel_manager, receptionist, restaurant_manager, kitchen_staff, cashier
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Active'
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    allowedModules: {
      type: DataTypes.JSON,
      allowNull: true
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'SystemUser',
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return SystemUser;
};
