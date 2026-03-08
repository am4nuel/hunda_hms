'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InventoryTransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      inventoryItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'InventoryItems', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      changeAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('Restock', 'Order_Usage', 'Manual_Adjustment', 'Waste'),
        allowNull: false
      },
      referenceId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT
      },
      hotelId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Hotels', key: 'id' },
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
    await queryInterface.dropTable('InventoryTransactions');
  }
};
