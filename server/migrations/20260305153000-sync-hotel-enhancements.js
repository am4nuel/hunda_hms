'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const safeQuery = async (queryFn) => {
      try {
        await queryFn();
      } catch (e) {
        console.log('Skipping due to error (likely already exists):', e.message);
      }
    };

    // 1. Create Banks table
    await safeQuery(() => queryInterface.createTable('Banks', {
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
      accountNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      accountHolder: {
        type: Sequelize.STRING,
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    }));

    // 2. Add fields to Guests
    await safeQuery(() => queryInterface.addColumn('Guests', 'idFront', { type: Sequelize.STRING, allowNull: true }));
    await safeQuery(() => queryInterface.addColumn('Guests', 'idBack', { type: Sequelize.STRING, allowNull: true }));

    // 3. Add fields to Bookings
    await safeQuery(() => queryInterface.addColumn('Bookings', 'bankId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Banks', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }));
    await safeQuery(() => queryInterface.addColumn('Bookings', 'paymentReceipt', { type: Sequelize.STRING, allowNull: true }));
    await safeQuery(() => queryInterface.addColumn('Bookings', 'userId', { type: Sequelize.UUID, allowNull: true }));
    await safeQuery(() => queryInterface.addColumn('Bookings', 'bookedNights', { type: Sequelize.INTEGER, allowNull: true }));
    await safeQuery(() => queryInterface.addColumn('Bookings', 'actualNights', { type: Sequelize.INTEGER, allowNull: true }));

    // 4. Add fields to Orders
    await safeQuery(() => queryInterface.addColumn('Orders', 'userId', { type: Sequelize.UUID, allowNull: true }));
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'userId');
    await queryInterface.removeColumn('Bookings', 'actualNights');
    await queryInterface.removeColumn('Bookings', 'bookedNights');
    await queryInterface.removeColumn('Bookings', 'userId');
    await queryInterface.removeColumn('Bookings', 'paymentReceipt');
    await queryInterface.removeColumn('Bookings', 'bankId');
    await queryInterface.removeColumn('Guests', 'idBack');
    await queryInterface.removeColumn('Guests', 'idFront');
    await queryInterface.dropTable('Banks');
  }
};
