'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Bookings', 'actualCheckOutDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Bookings', 'actualNights', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Actual nights stayed – may differ from booked nights on early checkout'
    });
    await queryInterface.addColumn('Bookings', 'bookedNights', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Originally booked nights at time of creation'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Bookings', 'actualCheckOutDate');
    await queryInterface.removeColumn('Bookings', 'actualNights');
    await queryInterface.removeColumn('Bookings', 'bookedNights');
  }
};
