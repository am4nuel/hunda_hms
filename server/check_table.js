const { TableReservation } = require('./models');
async function check() {
  try {
    const count = await TableReservation.count();
    console.log(`✅ TableReservation table exists. Count: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ TableReservation table check failed: ${err.message}`);
    process.exit(1);
  }
}
check();
