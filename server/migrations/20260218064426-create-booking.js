'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      checkInDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      checkOutDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Pending'
      },
      specialRequests: {
        type: Sequelize.TEXT
      },
      guestId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Guests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      hotelId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Hotels',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};