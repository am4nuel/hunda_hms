'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Hotels', 'pendingReservationDuration', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 60,
      comment: 'Duration in minutes before a pending reservation is considered expired and release the room back to available'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Hotels', 'pendingReservationDuration');
  }
};
