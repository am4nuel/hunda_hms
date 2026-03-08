const axios = require('axios');

async function test() {
  try {
    console.log('--- Testing /api/banks?hotelId=1 ---');
    try {
      const res = await axios.get('http://localhost:5000/api/banks?hotelId=1');
      console.log('Banks Response:', res.status, res.data);
    } catch (e) {
      console.log('Banks Error:', e.response?.status, e.response?.data);
    }

    console.log('\n--- Testing /api/reports/occupancy?hotelId=1 ---');
    try {
      const res = await axios.get('http://localhost:5000/api/reports/occupancy?hotelId=1');
      console.log('Occupancy Response:', res.status, res.data);
    } catch (e) {
      console.log('Occupancy Error:', e.response?.status, e.response?.data);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
