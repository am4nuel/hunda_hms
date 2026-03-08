'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'guestName', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'guestName');
    await queryInterface.removeColumn('Orders', 'phone');
  }
};
