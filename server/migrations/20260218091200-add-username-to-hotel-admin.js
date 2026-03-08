'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('HotelAdmins', 'userName', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('HotelAdmins', 'userName');
  }
};
