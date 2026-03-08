
const { HotelAdmin } = require('./models');
const sequelize = require('./db');
const bcrypt = require('bcryptjs');

async function verifyAndResetPassword() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const username = 'aman';
    const newPassword = 'admin123';

    const user = await HotelAdmin.findOne({ where: { userName: username } });

    if (!user) {
      console.log(`User '${username}' not found.`);
      return;
    }

    console.log(`Found user: ${user.userName} (ID: ${user.id})`);

    const isMatch = await bcrypt.compare(newPassword, user.password);

    if (isMatch) {
      console.log('Password verified: "admin123" is CORRECT.');
    } else {
      console.log('Password verified: "admin123" is INCORRECT.');
      console.log('Resetting password to "admin123"...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      user.password = hashedPassword;
      await user.save();
      
      console.log('Password reset successfully.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyAndResetPassword();
