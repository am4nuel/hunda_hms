'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove login fields (now handled by SystemUser)
    await queryInterface.removeColumn('Staffs', 'userName');
    await queryInterface.removeColumn('Staffs', 'password');

    // Add HR/Management fields
    await queryInterface.addColumn('Staffs', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Staffs', 'department', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Staffs', 'position', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Staffs', 'hireDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('Staffs', 'salary', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
    await queryInterface.addColumn('Staffs', 'systemUserId', {
      type: Sequelize.INTEGER,
      unique: true,
      references: {
        model: 'SystemUsers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Staffs', 'systemUserId');
    await queryInterface.removeColumn('Staffs', 'salary');
    await queryInterface.removeColumn('Staffs', 'hireDate');
    await queryInterface.removeColumn('Staffs', 'position');
    await queryInterface.removeColumn('Staffs', 'department');
    await queryInterface.removeColumn('Staffs', 'phoneNumber');
    
    await queryInterface.addColumn('Staffs', 'userName', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('Staffs', 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
