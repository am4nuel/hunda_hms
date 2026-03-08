'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' });
      OrderItem.belongsTo(models.MenuItem, { foreignKey: 'menuItemId' });
    }
  }
  OrderItem.init({
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priceAtOrder: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    notes: DataTypes.TEXT,
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    menuItemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};