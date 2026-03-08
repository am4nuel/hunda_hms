'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MenuItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MenuItem.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      MenuItem.belongsTo(models.MenuCategory, { foreignKey: 'categoryId' });
      MenuItem.hasMany(models.OrderItem, { foreignKey: 'menuItemId' });
      MenuItem.belongsTo(models.InventoryItem, { foreignKey: 'inventoryItemId', as: 'inventoryItem' });
      MenuItem.hasMany(models.RecipeIngredient, { foreignKey: 'menuItemId', as: 'recipeIngredients' });
    }
  }
  MenuItem.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    availability: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    image: DataTypes.STRING,
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    inventoryItemId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'MenuItem',
  });
  return MenuItem;
};