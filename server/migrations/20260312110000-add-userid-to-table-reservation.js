'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TableReservations', 'userId', {
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'Anonymous guest tracking ID'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TableReservations', 'userId');
  }
};
