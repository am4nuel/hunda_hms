
const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'aman',
      password: 'admin123'
    });
    console.log('Login successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Login failed:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
