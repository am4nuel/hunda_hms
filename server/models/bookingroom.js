'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      BookingRoom.belongsTo(models.Booking, { foreignKey: 'bookingId' });
      BookingRoom.belongsTo(models.Room, { foreignKey: 'roomId' });
    }
  }
  BookingRoom.init({
    bookingId: DataTypes.INTEGER,
    roomId: DataTypes.INTEGER,
    priceAtBooking: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'BookingRoom',
  });
  return BookingRoom;
};