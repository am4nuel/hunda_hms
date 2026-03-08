'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      ActivityLog.belongsTo(models.SystemUser, { foreignKey: 'userId', as: 'user' });
    }
  }
  ActivityLog.init({
    action: {
      type: DataTypes.STRING, // e.g., 'CREATE_BOOKING', 'UPDATE_STOCK', 'LOGIN'
      allowNull: false
    },
    module: {
      type: DataTypes.STRING, // e.g., 'Inventory', 'Booking', 'Menu'
      allowNull: false
    },
    details: DataTypes.TEXT, // Usually JSON string of what changed
    ipAddress: DataTypes.STRING,
    userAgent: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userRole: DataTypes.STRING, // Snapshot of role at time of action
    userName: DataTypes.STRING, // Snapshot of user name at time of action
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ActivityLog',
  });
  return ActivityLog;
};
