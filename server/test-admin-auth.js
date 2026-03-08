const jwt = require('jsonwebtoken');
const axios = require('axios');

async function testWithAdminAuth() {
  const token = jwt.sign(
    { id: 1, role: 'admin', hotelId: null },
    'secret_key',
    { expiresIn: '1h' }
  );

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  try {
    console.log('--- Testing /api/banks?hotelId=1 with Admin Auth ---');
    try {
      const res = await axios.get('http://localhost:5000/api/banks?hotelId=1', config);
      console.log('Banks Success:', res.data.length);
    } catch (e) {
      console.log('Banks Error:', e.status, e.response?.data);
    }

    console.log('\n--- Testing /api/reports/occupancy with Admin Auth ---');
    try {
      const res = await axios.get('http://localhost:5000/api/reports/occupancy', config);
      console.log('Occupancy Success:', res.data);
    } catch (e) {
      console.log('Occupancy Error:', e.status, e.response?.data);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testWithAdminAuth();
