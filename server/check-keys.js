const { Hotel } = require('./models');

async function checkKeys() {
  try {
    const hotels = await Hotel.findAll();
    console.log('--- Current Hotels and API Keys ---');
    hotels.forEach(h => {
      console.log(`Hotel: ${h.name} | ID: ${h.id} | Active: ${h.active} | API Key: ${h.apiKey} | AllowedUrls: ${h.allowedUrls}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkKeys();
