const axios = require('axios');

const API_URL = 'http://127.0.0.1:5000/api';
// Using the API key from the first hotel (generated during seeding)
const TEST_API_KEY = process.argv[2]; 

if (!TEST_API_KEY) {
  console.error('Please provide an API key as an argument.');
  process.exit(1);
}

const testEndpoints = async () => {
  const headers = { 'X-API-KEY': TEST_API_KEY };
  
  const endpoints = [
    '/hotels/my-hotel',
    '/themes',
    '/rooms',
    '/room-types',
    '/menu-categories',
    '/menu-items',
    '/dining-tables'
  ];

  console.log(`Testing API with Key: ${TEST_API_KEY}\n`);

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, { headers });
      console.log(`✅ [GET] ${endpoint}: Success (${Array.isArray(response.data) ? response.data.length + ' items' : 'Object'})`);
    } catch (error) {
      console.error(`❌ [GET] ${endpoint}: Failed (${error.response?.status || error.message})`);
      if (error.response?.data) console.error(JSON.stringify(error.response.data));
    }
  }
};

testEndpoints();
