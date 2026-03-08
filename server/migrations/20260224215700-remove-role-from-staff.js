'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Staffs', 'role');
    } catch (error) {
      console.log('Role column might already be removed');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Staffs', 'role', {
      type: Sequelize.STRING,
      allowNull: true // Allow null in down migration to avoid breaking existing data if rolled back
    });
  }
};
