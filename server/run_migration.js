const { Sequelize } = require('sequelize');
const config = require('./config/config.json').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: false,
  dialectOptions: config.dialectOptions
});

(async () => {
  try {
    await sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "userId" UUID');
    console.log('✅ userId column added to Orders');
    await sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "paymentType" VARCHAR(255) DEFAULT \'Pay Now\'');
    console.log('✅ paymentType column added to Orders');

    // Hotels Table Updates
    await sequelize.query('ALTER TABLE "Hotels" ADD COLUMN IF NOT EXISTS "pendingReservationDuration" INTEGER DEFAULT 60');
    console.log('✅ pendingReservationDuration column added to Hotels');

    // Suppliers Table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Suppliers" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "contactPerson" VARCHAR(255),
        "email" VARCHAR(255),
        "phoneNumber" VARCHAR(255),
        "address" TEXT,
        "hotelId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);
    console.log('✅ Suppliers table verified');

    // InventoryItems Updates
    await sequelize.query('ALTER TABLE "InventoryItems" ADD COLUMN IF NOT EXISTS "category" VARCHAR(255) DEFAULT \'Supplies\'');
    await sequelize.query('ALTER TABLE "InventoryItems" ADD COLUMN IF NOT EXISTS "costPrice" DECIMAL(10, 2) DEFAULT 0.00');
    await sequelize.query('ALTER TABLE "InventoryItems" ADD COLUMN IF NOT EXISTS "supplierId" INTEGER');
    await sequelize.query('ALTER TABLE "InventoryItems" ADD COLUMN IF NOT EXISTS "unitId" INTEGER');
    await sequelize.query('ALTER TABLE "InventoryItems" ALTER COLUMN "unit" DROP NOT NULL');
    console.log('✅ InventoryItems columns added and unit made nullable');

    // MenuItems Update
    await sequelize.query('ALTER TABLE "MenuItems" ADD COLUMN IF NOT EXISTS "inventoryItemId" INTEGER');
    console.log('✅ MenuItem inventory link added');

    // Activity Logs Table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "ActivityLogs" (
        "id" SERIAL PRIMARY KEY,
        "action" VARCHAR(255) NOT NULL,
        "module" VARCHAR(255) NOT NULL,
        "details" TEXT,
        "ipAddress" VARCHAR(255),
        "userAgent" VARCHAR(255),
        "userId" INTEGER,
        "userRole" VARCHAR(255),
        "userName" VARCHAR(255),
        "hotelId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);
    await sequelize.query('ALTER TABLE "ActivityLogs" ADD COLUMN IF NOT EXISTS "userRole" VARCHAR(255)');
    await sequelize.query('ALTER TABLE "ActivityLogs" ADD COLUMN IF NOT EXISTS "userName" VARCHAR(255)');
    console.log('✅ ActivityLogs table verified');

    // Password Reset Fields
    await sequelize.query('ALTER TABLE "SystemUsers" ADD COLUMN IF NOT EXISTS "resetPasswordToken" VARCHAR(255)');
    await sequelize.query('ALTER TABLE "SystemUsers" ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP WITH TIME ZONE');
    
    await sequelize.query('ALTER TABLE "HotelAdmins" ADD COLUMN IF NOT EXISTS "resetPasswordToken" VARCHAR(255)');
    await sequelize.query('ALTER TABLE "HotelAdmins" ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP WITH TIME ZONE');
    console.log('✅ Password reset columns added');

    // Restaurant Billing Integration
    await sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "bookingId" INTEGER');
    await sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "stockDeducted" BOOLEAN DEFAULT FALSE');
    console.log('✅ Order bookingId and stockDeducted columns verified');

    // Notifications Table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Notifications" (
        "id" SERIAL PRIMARY KEY,
        "type" VARCHAR(255) NOT NULL,
        "message" TEXT NOT NULL,
        "status" VARCHAR(255) DEFAULT 'Pending',
        "recipient" VARCHAR(255),
        "channel" VARCHAR(255) DEFAULT 'App',
        "bookingId" INTEGER,
        "guestId" INTEGER,
        "hotelId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);
    console.log('✅ Notifications table verified');

    // Units Table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Units" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "abbreviation" VARCHAR(255),
        "hotelId" INTEGER NOT NULL REFERENCES "Hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        UNIQUE("name", "hotelId")
      )
    `);
    // Units Table Refactor & Seeding
    await sequelize.query('ALTER TABLE "Units" ADD COLUMN IF NOT EXISTS "category" VARCHAR(255) DEFAULT \'Other\'');
    await sequelize.query('ALTER TABLE "Units" ADD COLUMN IF NOT EXISTS "baseUnitId" INTEGER');
    await sequelize.query('ALTER TABLE "Units" ADD COLUMN IF NOT EXISTS "conversionFactor" DECIMAL(10, 4) DEFAULT 1.0000');
    await sequelize.query('ALTER TABLE "Units" ALTER COLUMN "hotelId" DROP NOT NULL');
    console.log('✅ Units table schema updated for globalization');

    const now = new Date().toISOString();
    const standardUnits = [
      // Weight (Base: Gram)
      { name: 'Gram', abbreviation: 'g', category: 'Weight', conversionFactor: 1, baseUnitId: null },
      { name: 'Kilogram', abbreviation: 'kg', category: 'Weight', conversionFactor: 1000, baseUnitId: 'Gram' },
      { name: 'Milligram', abbreviation: 'mg', category: 'Weight', conversionFactor: 0.001, baseUnitId: 'Gram' },
      // Volume (Base: Milliliter)
      { name: 'Milliliter', abbreviation: 'ml', category: 'Volume', conversionFactor: 1, baseUnitId: null },
      { name: 'Liter', abbreviation: 'l', category: 'Volume', conversionFactor: 1000, baseUnitId: 'Milliliter' },
      // Count
      { name: 'Piece', abbreviation: 'pcs', category: 'Count', conversionFactor: 1, baseUnitId: null },
      { name: 'Pack', abbreviation: 'pack', category: 'Count', conversionFactor: 1, baseUnitId: null },
      { name: 'Dozen', abbreviation: 'doz', category: 'Count', conversionFactor: 12, baseUnitId: 'Piece' },
      { name: 'Box', abbreviation: 'box', category: 'Count', conversionFactor: 1, baseUnitId: null }
    ];

    for (const unit of standardUnits) {
      const [existing] = await sequelize.query(`SELECT id FROM "Units" WHERE name = '${unit.name}' AND "hotelId" IS NULL`);
      if (existing.length === 0) {
        let baseId = null;
        if (unit.baseUnitId) {
          const [base] = await sequelize.query(`SELECT id FROM "Units" WHERE name = '${unit.baseUnitId}' AND "hotelId" IS NULL`);
          baseId = base[0]?.id;
        }
        await sequelize.query(`
          INSERT INTO "Units" (name, abbreviation, category, "conversionFactor", "baseUnitId", "createdAt", "updatedAt")
          VALUES ('${unit.name}', '${unit.abbreviation}', '${unit.category}', ${unit.conversionFactor}, ${baseId}, '${now}', '${now}')
        `);
      }
    }
    console.log('✅ Standard units seeded');

    // RecipeIngredients Table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "RecipeIngredients" (
        "id" SERIAL PRIMARY KEY,
        "menuItemId" INTEGER NOT NULL REFERENCES "MenuItems"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "inventoryItemId" INTEGER NOT NULL REFERENCES "InventoryItems"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "quantityRequired" DECIMAL(10, 2) NOT NULL,
        "unit" VARCHAR(255),
        "unitId" INTEGER REFERENCES "Units"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);
    // RecipeIngredients Table Refactor
    await sequelize.query('ALTER TABLE "RecipeIngredients" ADD COLUMN IF NOT EXISTS "unitId" INTEGER');
    await sequelize.query('ALTER TABLE "RecipeIngredients" ALTER COLUMN "unit" DROP NOT NULL');
    console.log('✅ RecipeIngredients table schema updated');

    // InventoryItems Table Refactor
    await sequelize.query('ALTER TABLE "InventoryItems" ALTER COLUMN "currentStock" TYPE DECIMAL(10, 3)');
    await sequelize.query('ALTER TABLE "InventoryItems" ALTER COLUMN "lowStockThreshold" TYPE DECIMAL(10, 3)');
    console.log('✅ InventoryItems columns updated to DECIMAL');

    // InventoryTransactions Table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "InventoryTransactions" (
        "id" SERIAL PRIMARY KEY,
        "inventoryItemId" INTEGER NOT NULL REFERENCES "InventoryItems"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "changeAmount" DECIMAL(10, 2) NOT NULL,
        "type" VARCHAR(255) NOT NULL,
        "referenceId" VARCHAR(255),
        "notes" TEXT,
        "hotelId" INTEGER NOT NULL REFERENCES "Hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);
    console.log('✅ InventoryTransactions table verified');

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await sequelize.close();
  }
})();
