'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if category column exists before adding it
    const tableInfo = await queryInterface.describeTable('InventoryItems');
    
    if (!tableInfo.category) {
      await queryInterface.addColumn('InventoryItems', 'category', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Supplies'
      });
    }

    if (!tableInfo.costPrice) {
      await queryInterface.addColumn('InventoryItems', 'costPrice', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      });
    }

    if (!tableInfo.supplierId) {
      await queryInterface.addColumn('InventoryItems', 'supplierId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Suppliers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('InventoryItems', 'supplierId');
    await queryInterface.removeColumn('InventoryItems', 'costPrice');
    await queryInterface.removeColumn('InventoryItems', 'category');
  }
};
