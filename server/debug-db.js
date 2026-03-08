const { Bank, Room, Booking, Hotel } = require('./models');

async function test() {
  try {
    console.log('--- Testing Bank Fetch ---');
    const banks = await Bank.findAll({ where: { hotelId: 1 } });
    console.log('Banks found:', banks.length);

    console.log('\n--- Testing Room Count ---');
    const roomCount = await Room.count({ where: { hotelId: 1 } });
    console.log('Rooms found:', roomCount);

    console.log('\n--- Testing Booking Fetch (Occupancy) ---');
    const bookings = await Booking.findAll({
      where: {
        hotelId: 1,
        status: { $ne: 'Cancelled' } // Note: Op.ne might be needed if using modern sequelize
      }
    });
    console.log('Bookings found:', bookings.length);

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

test();
