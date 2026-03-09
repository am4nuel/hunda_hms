'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const safeAddColumn = async (table, column, definition) => {
      try {
        const desc = await queryInterface.describeTable(table);
        if (!desc[column]) {
          await queryInterface.addColumn(table, column, definition);
          console.log(`Added column ${column} to ${table}`);
        }
      } catch (e) {
        console.log(`Skipping column ${column} in ${table}: ${e.message}`);
      }
    };

    const safeCreateTable = async (table, definition) => {
      try {
        await queryInterface.createTable(table, definition);
        console.log(`Created table ${table}`);
      } catch (e) {
        console.log(`Skipping table ${table}: ${e.message}`);
      }
    };

    // 1. Create Suppliers table
    await safeCreateTable('Suppliers', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      contactPerson: Sequelize.STRING,
      email: Sequelize.STRING,
      phoneNumber: Sequelize.STRING,
      address: Sequelize.TEXT,
      hotelId: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Hotels', key: 'id' }, 
        onUpdate: 'CASCADE', 
        onDelete: 'CASCADE' 
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // 2. Create ActivityLogs table
    await safeCreateTable('ActivityLogs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      action: { type: Sequelize.STRING, allowNull: false },
      module: { type: Sequelize.STRING, allowNull: false },
      details: Sequelize.TEXT,
      ipAddress: Sequelize.STRING,
      userAgent: Sequelize.STRING,
      userId: { type: Sequelize.INTEGER, allowNull: true },
      userRole: Sequelize.STRING,
      userName: Sequelize.STRING,
      hotelId: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Hotels', key: 'id' }, 
        onUpdate: 'CASCADE', 
        onDelete: 'CASCADE' 
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // 3. Fix missing columns in existing tables
    await safeAddColumn('Orders', 'paymentType', { type: Sequelize.STRING, allowNull: true, defaultValue: 'Pay Now' });
    await safeAddColumn('MenuItems', 'inventoryItemId', { type: Sequelize.INTEGER, allowNull: true });
    await safeAddColumn('Units', 'category', { type: Sequelize.STRING, allowNull: false, defaultValue: 'Other' });
    
    // Add missing InventoryItem fields
    await safeAddColumn('InventoryItems', 'category', { type: Sequelize.STRING, allowNull: false, defaultValue: 'Supplies' });
    await safeAddColumn('InventoryItems', 'costPrice', { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 });
    await safeAddColumn('InventoryItems', 'supplierId', { 
      type: Sequelize.INTEGER, 
      allowNull: true, 
      references: { model: 'Suppliers', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add missing SystemUser fields
    await safeAddColumn('SystemUsers', 'allowedModules', { type: Sequelize.JSON, allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    // No down for repair
  }
};
