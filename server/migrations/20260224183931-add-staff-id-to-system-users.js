'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('SystemUsers', 'staffId', {
      type: Sequelize.INTEGER,
      unique: true,
      references: {
        model: 'Staffs',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('SystemUsers', 'staffId');
  }
};
