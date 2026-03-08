const { Bank } = require('./models');

async function testFetch() {
  try {
    console.log('--- Testing Bank.findAll ---');
    const banks = await Bank.findAll();
    console.log('Success (no filter):', banks.length);

    console.log('--- Testing Bank.findAll with hotelId=1 ---');
    const banksFiltered = await Bank.findAll({ where: { hotelId: 1 } });
    console.log('Success (filtered):', banksFiltered.length);
    
    process.exit(0);
  } catch (err) {
    console.error('ERROR FETCHING BANKS:', err);
    process.exit(1);
  }
}

testFetch();
