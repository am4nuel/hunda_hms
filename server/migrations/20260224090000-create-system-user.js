'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SystemUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'staff'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Active'
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

    await queryInterface.addIndex('SystemUsers', ['userName', 'hotelId'], {
      unique: true,
      name: 'system_users_user_name_hotel_id_unique'
    });

    await queryInterface.addIndex('SystemUsers', ['email', 'hotelId'], {
      unique: true,
      name: 'system_users_email_hotel_id_unique'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SystemUsers');
  }
};
