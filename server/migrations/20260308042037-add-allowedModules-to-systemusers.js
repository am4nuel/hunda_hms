'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('SystemUsers', 'allowedModules', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    } catch (error) {
       console.log('Column allowedModules already exists or error:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('SystemUsers', 'allowedModules');
    } catch (e) {
      // Ignore
    }
  }
};
