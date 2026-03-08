const jwt = require('jsonwebtoken');
const axios = require('axios');

async function testWithAuth() {
  const token = jwt.sign(
    { id: 1, role: 'hotel_admin', hotelId: 1 },
    'secret_key',
    { expiresIn: '1h' }
  );

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  try {
    console.log('--- Testing /api/banks?hotelId=1 with Auth ---');
    try {
      const res = await axios.get('http://localhost:5000/api/banks?hotelId=1', config);
      console.log('Banks Success:', res.data.length);
    } catch (e) {
      console.log('Banks Error:', e.response?.status, e.response?.data);
    }

    console.log('\n--- Testing /api/reports/occupancy with Auth ---');
    try {
      const res = await axios.get('http://localhost:5000/api/reports/occupancy', config);
      console.log('Occupancy Success:', res.data);
    } catch (e) {
      console.log('Occupancy Error:', e.response?.status, e.response?.data);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testWithAuth();
