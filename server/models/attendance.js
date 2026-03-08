'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.Staff, { foreignKey: 'staffId' });
      Attendance.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
    }
  }
  Attendance.init({
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Present'
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  return Attendance;
};
