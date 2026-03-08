'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RecipeIngredient extends Model {
    static associate(models) {
      RecipeIngredient.belongsTo(models.MenuItem, { foreignKey: 'menuItemId' });
      RecipeIngredient.belongsTo(models.InventoryItem, { foreignKey: 'inventoryItemId', as: 'inventoryItem' });
      RecipeIngredient.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'Unit' });
    }
  }
  RecipeIngredient.init({
    menuItemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    inventoryItemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantityRequired: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'RecipeIngredient',
  });
  return RecipeIngredient;
};
