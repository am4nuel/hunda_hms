const sequelize = require('./db');
const { Op } = require('sequelize');

async function check() {
  try {
    const [banksExist] = await sequelize.query("SELECT * FROM information_schema.tables WHERE table_name = 'Banks'");
    console.log('Banks table exists:', banksExist.length > 0);

    const [bookingCols] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Bookings'");
    console.log('Bookings columns:', bookingCols.map(c => c.column_name));

    const [guestCols] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Guests'");
    console.log('Guests columns:', guestCols.map(c => c.column_name));

    const [orderCols] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Orders'");
    console.log('Orders columns:', orderCols.map(c => c.column_name));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
