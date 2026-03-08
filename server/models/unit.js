const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Unit extends Model {
    static associate(models) {
      Unit.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
      Unit.belongsTo(Unit, { as: 'BaseUnit', foreignKey: 'baseUnitId' });
      Unit.hasMany(models.InventoryItem, { foreignKey: 'unitId' });
    }
  }

  Unit.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    abbreviation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Other'
    },
    baseUnitId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    conversionFactor: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      defaultValue: 1.0000
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Unit',
    indexes: [
      {
        unique: true,
        fields: ['name', 'hotelId']
      }
    ]
  });

  return Unit;
};
