const sequelize = require('./db');

async function checkSchema() {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('Banks', 'Bookings', 'Guests', 'Rooms')
      ORDER BY table_name, column_name;
    `);
    
    const schema = {};
    results.forEach(r => {
      if (!schema[r.table_name]) schema[r.table_name] = [];
      schema[r.table_name].push(r.column_name);
    });
    
    console.log('--- Database Schema Audit ---');
    Object.entries(schema).forEach(([table, columns]) => {
      console.log(`Table: ${table}`);
      console.log(`Columns: ${columns.join(', ')}`);
      if (!columns.includes('hotelId')) {
        console.log(`⚠️ MISSING hotelId in ${table}!`);
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
