'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      roomNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Available'
      },
      roomTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'RoomTypes',
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

    await queryInterface.addIndex('Rooms', ['roomNumber', 'hotelId'], {
      unique: true,
      name: 'rooms_room_number_hotel_id_unique'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Rooms');
  }
};