'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MenuCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MenuCategory.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      MenuCategory.hasMany(models.MenuItem, { foreignKey: 'categoryId' });
    }
  }
  MenuCategory.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MenuCategory',
  });
  return MenuCategory;
};