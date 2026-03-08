const { Guest } = require('./models');

async function check() {
  try {
    const guests = await Guest.findAll({
        attributes: ['id', 'firstName', 'email', 'userId', 'hotelId']
    });
    console.log(JSON.stringify(guests, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

check();
