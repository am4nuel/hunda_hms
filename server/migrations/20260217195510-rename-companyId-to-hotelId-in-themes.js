'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Themes', 'companyId', 'hotelId');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Themes', 'hotelId', 'companyId');
  }
};
