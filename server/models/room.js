'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Room.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      Room.belongsTo(models.RoomType, { foreignKey: 'roomTypeId' });
      Room.belongsToMany(models.Booking, { 
        through: models.BookingRoom,
        foreignKey: 'roomId'
      });
    }
  }
  Room.init({
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Available'
    },
    roomTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};