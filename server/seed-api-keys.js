const { Hotel } = require('./models');
const crypto = require('crypto');

const seedApiKeys = async () => {
  try {
    const hotels = await Hotel.findAll();
    console.log(`Found ${hotels.length} hotels to seed.`);

    for (const hotel of hotels) {
      if (!hotel.apiKey) {
        const key = `hk_${crypto.randomBytes(24).toString('hex')}`;
        const allowedUrls = JSON.stringify(['*']); // Allow all by default for existing hotels
        await hotel.update({ apiKey: key, allowedUrls });
        console.log(`Updated hotel ${hotel.name} (ID: ${hotel.id}) with API Key: ${key}`);
      } else {
        console.log(`Hotel ${hotel.name} already has an API key.`);
      }
    }
    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedApiKeys();
