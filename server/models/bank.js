'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bank extends Model {
    static associate(models) {
      Bank.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      Bank.hasMany(models.Booking, { foreignKey: 'bankId' });
    }
  }
  Bank.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountHolder: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Bank',
  });
  return Bank;
};
