'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InventoryItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      currentStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lowStockThreshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
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

    await queryInterface.addIndex('InventoryItems', ['name', 'hotelId'], {
      unique: true,
      name: 'inventory_items_name_hotel_id_unique'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('InventoryItems');
  }
};