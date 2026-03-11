'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // We need to check if the column exists first to make it idempotent
    const tableInfo = await queryInterface.describeTable('Units');
    
    // Drop the unique constraint if it exists first
    try {
      await queryInterface.removeConstraint('Units', 'Units_name_hotelId_key');
    } catch (e) {
      // Ignore if it doesn't exist
    }

    // Add a new unique constraint just for name
    try {
       await queryInterface.addConstraint('Units', {
        fields: ['name'],
        type: 'unique',
        name: 'Units_name_key'
      });
    } catch (e) {
      // Ignore if it already exists
    }

    if (tableInfo.hotelId) {
      await queryInterface.removeColumn('Units', 'hotelId');
    }
  },

  async down (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Units');
    
    if (!tableInfo.hotelId) {
      await queryInterface.addColumn('Units', 'hotelId', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }

    try {
      await queryInterface.removeConstraint('Units', 'Units_name_key');
    } catch (e) {}

    try {
      await queryInterface.addConstraint('Units', {
        fields: ['name', 'hotelId'],
        type: 'unique',
        name: 'Units_name_hotelId_key'
      });
    } catch (e) {}
  }
};
