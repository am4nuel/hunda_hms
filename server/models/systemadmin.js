'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SystemAdmin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SystemAdmin.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    userName: {
      type: DataTypes.STRING,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    profilePicture: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      defaultValue: 'admin'
    }
  }, {
    sequelize,
    modelName: 'SystemAdmin',
  });
  return SystemAdmin;
};