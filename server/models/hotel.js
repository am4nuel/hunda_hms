'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Hotel.hasMany(models.HotelAdmin, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.Theme, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.RoomType, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.Room, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.Guest, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.Booking, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.Staff, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.MenuCategory, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.MenuItem, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.Order, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.InventoryItem, { foreignKey: 'hotelId' });
      Hotel.hasMany(models.TableReservation, { foreignKey: 'hotelId' });
    }
  }
  Hotel.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    email: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    apiKey: DataTypes.STRING,
    allowedUrls: DataTypes.TEXT, // Storing as JSON string
    pendingReservationDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60
    }
  }, {
    sequelize,
    modelName: 'Hotel',
  });
  return Hotel;
};