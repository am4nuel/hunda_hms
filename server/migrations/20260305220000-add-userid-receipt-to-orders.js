'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('Orders');

    if (!tableDesc.userId) {
      await queryInterface.addColumn('Orders', 'userId', {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'Anonymous guest tracking ID',
      });
    }

    if (!tableDesc.paymentReceipt) {
      await queryInterface.addColumn('Orders', 'paymentReceipt', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Orders', 'userId');
    await queryInterface.removeColumn('Orders', 'paymentReceipt');
  },
};
