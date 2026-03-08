const sequelize = require('./db');
const fs = require('fs');

async function audit() {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('Banks', 'Bookings', 'Guests', 'Orders', 'Rooms')
    `);
    
    fs.writeFileSync('audit_results.json', JSON.stringify(results, null, 2));
    console.log('Audit results written to audit_results.json');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

audit();
