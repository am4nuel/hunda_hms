'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Themes', 'sidebarColor', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Themes', 'sidebarTextColor', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Themes', 'headerColor', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Themes', 'headerTextColor', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Themes', 'sidebarColor');
    await queryInterface.removeColumn('Themes', 'sidebarTextColor');
    await queryInterface.removeColumn('Themes', 'headerColor');
    await queryInterface.removeColumn('Themes', 'headerTextColor');
  }
};
