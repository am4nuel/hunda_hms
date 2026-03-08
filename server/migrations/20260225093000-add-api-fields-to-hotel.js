'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Hotels', 'apiKey', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
    await queryInterface.addColumn('Hotels', 'allowedUrls', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '[]' // Storing as JSON string in TEXT field
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Hotels', 'apiKey');
    await queryInterface.removeColumn('Hotels', 'allowedUrls');
  }
};
