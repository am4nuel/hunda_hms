module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('HotelAdmins', 'resetPasswordToken', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (e) {
      console.log('resetPasswordToken already exists');
    }
    
    try {
      await queryInterface.addColumn('HotelAdmins', 'resetPasswordExpires', {
        type: Sequelize.DATE,
        allowNull: true
      });
    } catch (e) {
      console.log('resetPasswordExpires already exists');
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('HotelAdmins', 'resetPasswordToken');
    } catch (e) {}

    try {
      await queryInterface.removeColumn('HotelAdmins', 'resetPasswordExpires');
    } catch (e) {}
  }
};
