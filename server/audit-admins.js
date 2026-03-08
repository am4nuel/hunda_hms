const { HotelAdmin, Hotel } = require('./models');

async function auditAdmins() {
  try {
    const admins = await HotelAdmin.findAll({ include: [Hotel] });
    console.log('--- Hotel Admins Audit ---');
    admins.forEach(a => {
      console.log(`Admin: ${a.userName}, HotelId: ${a.hotelId}, HotelName: ${a.Hotel?.name || 'MISSING!'}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

auditAdmins();
