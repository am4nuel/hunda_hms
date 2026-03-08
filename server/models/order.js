'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      Order.belongsTo(models.Booking, { foreignKey: 'bookingId' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
    }
  }
  Order.init({
    tableNumber: DataTypes.STRING,
    orderType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0
    },
    bookingId: DataTypes.INTEGER,
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    guestName: DataTypes.STRING,
    phone: DataTypes.STRING,
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Anonymous guest tracking ID'
    },
    paymentReceipt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Pay Now'
    },
    stockDeducted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};