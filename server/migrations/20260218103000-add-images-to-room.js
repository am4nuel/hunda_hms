'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Rooms', 'images', {
      type: Sequelize.JSONB,
      defaultValue: []
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Rooms', 'images');
  }
};
