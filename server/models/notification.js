'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      Notification.belongsTo(models.Booking, { foreignKey: 'bookingId' });
      Notification.belongsTo(models.Guest, { foreignKey: 'guestId' });
    }
  }
  Notification.init({
    type: {
      type: DataTypes.STRING,
      allowNull: false // e.g., 'PaymentConfirmation', 'CheckInReminder', 'CheckOutReminder'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Pending' // Pending, Sent, Failed
    },
    recipient: DataTypes.STRING, // email or phone
    channel: {
      type: DataTypes.STRING,
      defaultValue: 'App' // App, Email, SMS
    },
    bookingId: DataTypes.INTEGER,
    guestId: DataTypes.INTEGER,
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};
