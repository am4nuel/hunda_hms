'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TableReservations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      guestName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      guestPhone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      guestEmail: {
        type: Sequelize.STRING
      },
      reservationTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      numberOfGuests: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Pending'
      },
      notes: {
        type: Sequelize.TEXT
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
      diningTableId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'DiningTables',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('TableReservations');
  }
};
