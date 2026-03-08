'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Theme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Theme.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
    }
  }
  Theme.init({
    name: DataTypes.STRING,
    primaryColor: DataTypes.STRING,
    secondaryColor: DataTypes.STRING,
    accentColor: DataTypes.STRING,
    backgroundColor: DataTypes.STRING,
    textColor: DataTypes.STRING,
    sidebarColor: DataTypes.STRING,
    sidebarTextColor: DataTypes.STRING,
    headerColor: DataTypes.STRING,
    headerTextColor: DataTypes.STRING,
    hotelId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Theme',
  });
  return Theme;
};