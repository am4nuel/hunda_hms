'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TableReservation extends Model {
    static associate(models) {
      TableReservation.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      TableReservation.belongsTo(models.DiningTable, { foreignKey: 'diningTableId' });
    }
  }
  TableReservation.init({
    guestName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    guestPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    guestEmail: DataTypes.STRING,
    reservationTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    numberOfGuests: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending' // Pending, Confirmed, Checked In, Cancelled, Completed
    },
    notes: DataTypes.TEXT,
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    diningTableId: {
      type: DataTypes.INTEGER,
      allowNull: true // Can be null initially if table is not assigned
    }
  }, {
    sequelize,
    modelName: 'TableReservation',
  });
  return TableReservation;
};
