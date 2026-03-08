'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      Supplier.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      Supplier.hasMany(models.InventoryItem, { foreignKey: 'supplierId', as: 'items' });
    }
  }
  Supplier.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactPerson: DataTypes.STRING,
    email: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    address: DataTypes.TEXT,
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Supplier',
  });
  return Supplier;
};
