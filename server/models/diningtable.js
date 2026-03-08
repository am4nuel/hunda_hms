'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DiningTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DiningTable.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
    }
  }
  DiningTable.init({
    number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacity: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Available'
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'DiningTable',
  });
  return DiningTable;
};