const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('./config/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: true,
  dialectOptions: config.dialectOptions
});

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Please specify a migration file');
  process.exit(1);
}

const migration = require(path.resolve(migrationFile));

(async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    console.log(`Applying migration: ${migrationFile}`);
    await migration.up(queryInterface, Sequelize);
    console.log('✅ Migration applied successfully');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Migration failed: ${err.message}`);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
