'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HotelAdmin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      HotelAdmin.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
    }
  }
  HotelAdmin.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    userName: {
      type: DataTypes.STRING,
      unique: true
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    hotelId: DataTypes.INTEGER,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'HotelAdmin',
  });
  return HotelAdmin;
};