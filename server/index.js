const express = require("express");
const cors = require("cors");

const http = require("http");
const { initSocket } = require("./utils/socket");

const path = require("path");
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

const { Hotel } = require("./models");

const CORS_WHITELIST = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : [];

const corsOptions = {
  origin: async (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    try {
      // Fetch all hotels that have allowedUrls defined
      const hotels = await Hotel.findAll({
        attributes: ['allowedUrls'],
        where: { active: true }
      });

      const allAllowedUrls = hotels.reduce((acc, hotel) => {
        try {
          const urls = JSON.parse(hotel.allowedUrls || '[]');
          return acc.concat(urls);
        } catch (e) {
          return acc;
        }
      }, [...CORS_WHITELIST]); // Include whitelist from environment variables

      // In development, allow localhost
      if (process.env.NODE_ENV !== 'production') {
        allAllowedUrls.push('http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000');
      }

      if (allAllowedUrls.indexOf(origin) !== -1 || allAllowedUrls.includes('*')) {
        callback(null, true);
      } else {
        console.warn(`Origin ${origin} not allowed by CORS`);
        callback(new Error('Not allowed by CORS'));
      }
    } catch (error) {
      console.error('CORS error:', error);
      callback(error);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Initialize Socket.io
initSocket(server);

const sequelize = require('./db');
const authRoutes = require('./routes/auth.routes');
const themeRoutes = require('./routes/theme.routes');
const hotelRoutes = require('./routes/hotel.routes');
const hotelAdminRoutes = require('./routes/hoteladmin.routes');
const roomRoutes = require('./routes/room.routes');
const roomTypeRoutes = require('./routes/roomtype.routes');
const uploadRoutes = require('./routes/upload.routes.js');
const guestRoutes = require('./routes/guest.routes');
const bookingRoutes = require('./routes/booking.routes');
const systemUserRoutes = require('./routes/systemuser.routes');
const menuCategoryRoutes = require('./routes/menucategory.routes');
const menuItemRoutes = require('./routes/menuitem.routes');
const orderRoutes = require('./routes/order.routes');
const diningTableRoutes = require('./routes/diningtable.routes');
const staffRoutes = require('./routes/staff.routes');
const reportRoutes = require('./routes/report.routes');
const bankRoutes = require('./routes/bank.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const activityLogRoutes = require('./routes/activityLog.routes');
const notificationRoutes = require('./routes/notification.routes');
const recipeRoutes = require('./routes/recipe.routes');
const unitRoutes = require('./routes/unit.routes');
const tableReservationRoutes = require('./routes/tablereservation.routes');

app.get("/", (req, res) => {
  res.send("Hello from Express Server with WebSockets!");
});

app.use('/api/auth', authRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotel-admins', hotelAdminRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/system-users', systemUserRoutes);
app.use('/api/menu-categories', menuCategoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dining-tables', diningTableRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/table-reservations', tableReservationRoutes);

const { seedUnits } = require('./utils/seedUnits');
const { Umzug, SequelizeStorage } = require('umzug');

const runMigrations = async (sq) => {
  const umzug = new Umzug({
    migrations: { glob: `${__dirname}/migrations/*.js` },
    context: sq.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: sq }),
    logger: console,
  });
  await umzug.up();
};

server.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Run all pending migrations automatically on startup
    try {
      await runMigrations(sequelize);
    } catch (migErr) {
      console.error('Migration error:', migErr.message);
    }
    
    // Run seeders conditionally or unconditionally based on business logic
    await seedUnits();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  console.log(`Server is running on port ${PORT}`);
});
