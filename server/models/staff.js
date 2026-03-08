'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    static associate(models) {
      Staff.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      Staff.belongsTo(models.SystemUser, { foreignKey: 'systemUserId', as: 'User' });
      Staff.hasMany(models.Attendance, { foreignKey: 'staffId' });
      Staff.hasMany(models.Shift, { foreignKey: 'staffId' });
    }
  }
  Staff.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
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
    systemUserId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Staff',
  });
  return Staff;
};