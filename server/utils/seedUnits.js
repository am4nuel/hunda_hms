const { Unit } = require('../models');

const defaultUnits = [
  // Volume units
  { name: 'Liter', abbreviation: 'L', category: 'Volume' },
  { name: 'Milliliter', abbreviation: 'ml', category: 'Volume' },
  { name: 'Gallon', abbreviation: 'gal', category: 'Volume' },
  { name: 'Fluid Ounce', abbreviation: 'fl oz', category: 'Volume' },
  
  // Weight units
  { name: 'Kilogram', abbreviation: 'kg', category: 'Weight' },
  { name: 'Gram', abbreviation: 'g', category: 'Weight' },
  { name: 'Pound', abbreviation: 'lb', category: 'Weight' },
  { name: 'Ounce', abbreviation: 'oz', category: 'Weight' },
  
  // Count/Item units
  { name: 'Piece', abbreviation: 'pc', category: 'Count' },
  { name: 'Dozen', abbreviation: 'dz', category: 'Count' },
  { name: 'Box', abbreviation: 'box', category: 'Count' },
  { name: 'Carton', abbreviation: 'ctn', category: 'Count' },
  { name: 'Case', abbreviation: 'case', category: 'Count' },
  
  // Length units
  { name: 'Meter', abbreviation: 'm', category: 'Length' },
  { name: 'Centimeter', abbreviation: 'cm', category: 'Length' },
  
  // Other
  { name: 'Portion', abbreviation: 'ptn', category: 'Other' },
  { name: 'Serving', abbreviation: 'srv', category: 'Other' }
];

const seedUnits = async () => {
  try {
    console.log('Running unit seeder...');
    let seededCount = 0;

    for (const unit of defaultUnits) {
      const [record, created] = await Unit.findOrCreate({
        where: { name: unit.name },
        defaults: unit
      });

      if (created) {
        seededCount++;
      }
    }

    if (seededCount > 0) {
      console.log(`Successfully seeded ${seededCount} new base units.`);
    } else {
      console.log('Units already exist. No new units were seeded.');
    }
  } catch (error) {
    console.error('Error seeding units:', error);
  }
};

module.exports = { seedUnits, defaultUnits };
