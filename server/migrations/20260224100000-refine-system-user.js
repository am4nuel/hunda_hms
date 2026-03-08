'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SystemUsers', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn('SystemUsers', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('SystemUsers', 'phoneNumber');
    await queryInterface.changeColumn('SystemUsers', 'email', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
