'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('Guests');
    if (!tableDesc.userId) {
      await queryInterface.addColumn('Guests', 'userId', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Anonymous user tracking ID'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Guests', 'userId');
  }
};
