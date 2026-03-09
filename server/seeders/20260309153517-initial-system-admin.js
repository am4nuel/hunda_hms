'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('SystemAdmins', [{
      firstName: 'System',
      lastName: 'Administrator',
      userName: 'admin',
      email: 'admin@hunda.com',
      password: hashedPassword,
      phoneNumber: '0900000000',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SystemAdmins', { userName: 'admin' }, {});
  }
};
