'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Themes', [
      {
        name: 'Default Blue',
        primaryColor: '#3b82f6',
        secondaryColor: '#60a5fa',
        accentColor: '#1d4ed8',
        backgroundColor: '#f8fafc',
        textColor: '#0f172a',
        companyId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Nature Green',
        primaryColor: '#10b981',
        secondaryColor: '#34d399',
        accentColor: '#047857',
        backgroundColor: '#f0fdf4',
        textColor: '#064e3b',
        companyId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Midnight Dark',
        primaryColor: '#6366f1',
        secondaryColor: '#818cf8',
        accentColor: '#4338ca',
        backgroundColor: '#0f172a',
        textColor: '#f8fafc',
        companyId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Themes', null, {});
  }
};
