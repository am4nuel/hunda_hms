'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DiningTables', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER,
        defaultValue: 2
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Available'
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
    await queryInterface.dropTable('DiningTables');
  }
};