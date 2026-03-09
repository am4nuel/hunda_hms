module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('HotelAdmins', 'resetPasswordToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('HotelAdmins', 'resetPasswordExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('HotelAdmins', 'resetPasswordToken');
    await queryInterface.removeColumn('HotelAdmins', 'resetPasswordExpires');
  }
};
