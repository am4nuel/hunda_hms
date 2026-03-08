'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {
    static associate(models) {
      Shift.belongsTo(models.Staff, { foreignKey: 'staffId' });
      Shift.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
    }
  }
  Shift.init({
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Scheduled'
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Shift',
  });
  return Shift;
};