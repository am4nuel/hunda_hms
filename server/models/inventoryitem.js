'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventoryItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      InventoryItem.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      InventoryItem.belongsTo(models.Supplier, { foreignKey: 'supplierId', as: 'supplier' });
      InventoryItem.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'Unit' });
      InventoryItem.hasMany(models.RecipeIngredient, { foreignKey: 'inventoryItemId', as: 'recipeIngredients' });
      InventoryItem.hasMany(models.InventoryTransaction, { foreignKey: 'inventoryItemId', as: 'transactions' });
    }
  }
  InventoryItem.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Supplies'
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    currentStock: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0.000
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    lowStockThreshold: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 1.000
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'InventoryItem',
  });
  return InventoryItem;
};