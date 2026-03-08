'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventoryTransaction extends Model {
    static associate(models) {
      InventoryTransaction.belongsTo(models.InventoryItem, { foreignKey: 'inventoryItemId', as: 'inventoryItem' });
      InventoryTransaction.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
    }
  }
  InventoryTransaction.init({
    inventoryItemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    changeAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Restock', 'Order_Usage', 'Manual_Adjustment', 'Waste'),
      allowNull: false
    },
    referenceId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Could be orderId, restockId, etc.'
    },
    notes: DataTypes.TEXT,
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'InventoryTransaction',
  });
  return InventoryTransaction;
};
