'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const safeAddColumn = async (table, column, definition) => {
      try {
        const desc = await queryInterface.describeTable(table);
        if (!desc[column]) {
          await queryInterface.addColumn(table, column, definition);
        }
      } catch (e) {
        console.log(`Skipping ${column} in ${table}: ${e.message}`);
      }
    };

    const safeCreateTable = async (table, definition) => {
      try {
        await queryInterface.createTable(table, definition);
      } catch (e) {
        console.log(`Skipping table ${table}: ${e.message}`);
      }
    };

    // 1. Create Notifications table
    await safeCreateTable('Notifications', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      type: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING, defaultValue: 'Pending' },
      recipient: Sequelize.STRING,
      channel: { type: Sequelize.STRING, defaultValue: 'App' },
      bookingId: Sequelize.INTEGER,
      guestId: Sequelize.INTEGER,
      hotelId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Hotels', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    // 2. Fix Units table
    await safeAddColumn('Units', 'baseUnitId', { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Units', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });
    await safeAddColumn('Units', 'conversionFactor', { type: Sequelize.DECIMAL(10, 4), allowNull: true, defaultValue: 1.0000 });

    // 3. Fix InventoryItems table
    await safeAddColumn('InventoryItems', 'unitId', { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Units', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });

    // 4. Fix Orders table
    await safeAddColumn('Orders', 'stockDeducted', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });

    // 5. Fix RecipeIngredients table
    await safeAddColumn('RecipeIngredients', 'unitId', { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Units', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });

    // 6. Fix SystemUsers table
    await safeAddColumn('SystemUsers', 'resetPasswordToken', { type: Sequelize.STRING, allowNull: true });
    await safeAddColumn('SystemUsers', 'resetPasswordExpires', { type: Sequelize.DATE, allowNull: true });
  },

  async down(queryInterface, Sequelize) {}
};
