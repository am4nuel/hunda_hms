'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoomType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RoomType.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      RoomType.hasMany(models.Room, { foreignKey: 'roomTypeId' });
    }
  }
  RoomType.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    basePrice: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amenities: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'RoomType',
  });
  return RoomType;
};