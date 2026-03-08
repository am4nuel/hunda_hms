'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Attendances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Staffs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      checkIn: {
        type: Sequelize.DATE
      },
      checkOut: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Present' // Present, Late, Absent, Half Day
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
      notes: {
        type: Sequelize.TEXT
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

    await queryInterface.addIndex('Attendances', ['staffId', 'date'], {
      unique: true,
      name: 'attendances_staff_id_date_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Attendances');
  }
};
