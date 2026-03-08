
const { SystemAdmin, HotelAdmin } = require('./models');
const sequelize = require('./db');
const fs = require('fs');

async function listUsers() {
  try {
    await sequelize.authenticate();
    const systemAdmins = await SystemAdmin.findAll();
    const hotelAdmins = await HotelAdmin.findAll();

    const output = {
      systemAdmins: systemAdmins.map(u => ({ id: u.id, username: u.userName, email: u.email, passwordHash: u.password })),
      hotelAdmins: hotelAdmins.map(u => ({ id: u.id, username: u.userName, email: u.email, passwordHash: u.password }))
    };

    fs.writeFileSync('users.json', JSON.stringify(output, null, 2), 'utf8');
    console.log('User data written to users.json');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

listUsers();
