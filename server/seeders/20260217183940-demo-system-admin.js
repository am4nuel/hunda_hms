'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('SystemAdmins', [{
      firstName: 'System',
      lastName: 'Admin',
      userName: 'admin',
      email: 'admin@system.com',
      password: hashedPassword,
      phoneNumber: '1234567890',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SystemAdmins', null, {});
  }
};
