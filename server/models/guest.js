'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Guest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Guest.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      Guest.hasMany(models.Booking, { foreignKey: 'guestId' });
    }
  }
  Guest.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    idType: DataTypes.STRING,
    idNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idFront: DataTypes.STRING,
    idBack: DataTypes.STRING,
    notes: DataTypes.TEXT,
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Anonymous user tracking ID'
    }
  }, {
    sequelize,
    modelName: 'Guest',
  });
  return Guest;
};