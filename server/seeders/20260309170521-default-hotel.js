'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Hotels', [{
      name: 'Hunda Hotel',
      address: 'Railway Deployment',
      phoneNumber: '0900000000',
      email: 'info@hunda.com',
      active: true,
      apiKey: 'hunda_default_api_key',
      allowedUrls: JSON.stringify([
        'https://hundahms-production.up.railway.app',
        'https://hundahmsdashboard.netlify.app',
        'http://localhost:5173',
        'http://localhost:5174'
      ]),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Hotels', { name: 'Hunda Hotel' }, {});
  }
};
