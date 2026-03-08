const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_KEY = 'hk_6540ab3282f29796f332d6afdc52282268d30969ca9f5945';
const UPLOAD_URL = 'http://127.0.0.1:5000/api/upload';

async function testUpload() {
  const form = new FormData();
  // Create a dummy image file
  const dummyFile = path.join(__dirname, 'dummy.png');
  fs.writeFileSync(dummyFile, 'dummy content');

  form.append('images', fs.createReadStream(dummyFile));

  try {
    const response = await axios.post(UPLOAD_URL, form, {
      headers: {
        ...form.getHeaders(),
        'X-API-KEY': API_KEY
      }
    });
    console.log('✅ Upload Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.error(`❌ Upload Failed: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    if (fs.existsSync(dummyFile)) fs.unlinkSync(dummyFile);
  }
}

testUpload();
