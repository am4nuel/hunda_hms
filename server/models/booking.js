'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Booking.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      Booking.belongsTo(models.Guest, { foreignKey: 'guestId' });
      Booking.belongsTo(models.Bank, { foreignKey: 'bankId' });
      Booking.belongsToMany(models.Room, { 
        through: models.BookingRoom,
        foreignKey: 'bookingId'
      });
      Booking.hasMany(models.Order, { foreignKey: 'bookingId' });
    }
  }
  Booking.init({
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    actualCheckOutDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Actual date the guest checked out (set at checkout time)'
    },
    bookedNights: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Originally booked nights'
    },
    actualNights: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Actual nights stayed – recalculated at checkout'
    },
    totalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending'
    },
    specialRequests: DataTypes.TEXT,
    guestId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bankId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    paymentReceipt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Anonymous user tracking ID'
    }
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};