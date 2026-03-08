const { Booking, Guest, Room, Order, OrderItem, MenuItem, MenuCategory, sequelize } = require('../models');
const { Op } = require('sequelize');

const getRoomOccupancy = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const totalRooms = await Room.count({ where: { hotelId } });
    
    const bookings = await Booking.findAll({
      where: {
        hotelId,
        status: { [Op.ne]: 'Cancelled' },
        [Op.or]: [
          { checkInDate: { [Op.between]: [start, end] } },
          { checkOutDate: { [Op.between]: [start, end] } }
        ]
      }
    });

    // Simple occupancy logic: total booked nights / (total rooms * days in period)
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const occupancyRate = totalRooms > 0 ? (bookings.length / (totalRooms * daysDiff)) * 100 : 0;

    res.status(200).json({
      totalRooms,
      bookedUnits: bookings.length,
      occupancyRate: Math.min(occupancyRate, 100).toFixed(2),
      period: { start, end }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { startDate, endDate } = req.query;

    const where = { hotelId, status: 'Completed' };
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const sales = await Order.findAll({
      where,
      attributes: [
        'orderType',
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
      ],
      group: ['orderType']
    });

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPopularItems = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { limit = 10 } = req.query;

    const popularItems = await OrderItem.findAll({
      attributes: [
        'menuItemId',
        [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'totalSold']
      ],
      include: [
        {
          model: MenuItem,
          where: { hotelId },
          attributes: ['name', 'price']
        },
        {
          model: Order,
          where: { status: 'Completed' },
          attributes: []
        }
      ],
      group: ['OrderItem.menuItemId', 'MenuItem.id'],
      order: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'DESC']],
      limit: parseInt(limit),
      subQuery: false
    });

    res.status(200).json(popularItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRevenueSummary = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { startDate, endDate } = req.query;

    const period = {};
    if (startDate && endDate) {
      period[Op.between] = [new Date(startDate), new Date(endDate)];
    }

    const dateFilter = startDate ? { createdAt: period } : {};

    // Only count bookings that are Checked In or Checked Out (i.e., actually paid/consuming a room)
    const bookingRevenue = await Booking.sum('totalAmount', {
      where: {
        hotelId,
        status: { [Op.in]: ['Checked In', 'Checked Out'] },
        ...dateFilter
      }
    }) || 0;

    const checkedInCount = await Booking.count({
      where: {
        hotelId,
        status: 'Checked In',
        ...dateFilter
      }
    });

    const checkedOutCount = await Booking.count({
      where: {
        hotelId,
        status: 'Checked Out',
        ...dateFilter
      }
    });

    // Only count Completed food orders (served)
    const orderRevenue = await Order.sum('totalAmount', {
      where: { hotelId, status: 'Completed', ...dateFilter }
    }) || 0;

    const orderCount = await Order.count({
      where: { hotelId, status: 'Completed', ...dateFilter }
    });

    res.status(200).json({
      bookingRevenue: parseFloat(bookingRevenue),
      orderRevenue: parseFloat(orderRevenue),
      totalRevenue: parseFloat(bookingRevenue) + parseFloat(orderRevenue),
      checkedInCount,
      checkedOutCount,
      totalPaidBookings: checkedInCount + checkedOutCount,
      servedOrderCount: orderCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc   Category-level sales report used by the report dropdown
// @route  GET /api/reports/category-sales
// Returns a unified dataset for All / Rooms / Foods / Beverage tabs
const getCategorySalesReport = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });
    const { startDate, endDate } = req.query;

    const dateRange = startDate && endDate
      ? { [Op.between]: [new Date(startDate), new Date(endDate)] }
      : undefined;

    const createdAtFilter = dateRange ? { createdAt: dateRange } : {};

    // ── ROOMS: Checked In + Checked Out bookings (paid stays) ──────────────
    const roomBookings = await Booking.findAll({
      where: {
        hotelId,
        status: { [Op.in]: ['Checked In', 'Checked Out'] },
        ...createdAtFilter
      },
      include: [
        { model: Guest, attributes: ['firstName', 'lastName', 'email'] },
        { model: Room, through: { attributes: ['priceAtBooking'] }, attributes: ['id', 'roomNumber'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const roomRows = roomBookings.map(b => ({
      id: b.id,
      guestName: b.Guest ? `${b.Guest.firstName} ${b.Guest.lastName}` : 'N/A',
      guestEmail: b.Guest?.email || '',
      rooms: b.Rooms.map(r => r.roomNumber).join(', '),
      checkInDate: b.checkInDate,
      bookedCheckOut: b.checkOutDate,
      actualCheckOut: b.actualCheckOutDate || null,
      bookedNights: b.bookedNights || 0,
      actualNights: b.actualNights || b.bookedNights || 0,
      earlyCheckout: !!(b.actualNights && b.bookedNights && b.actualNights < b.bookedNights),
      totalAmount: parseFloat(b.totalAmount) || 0,
      status: b.status
    }));

    // ── FOODS & BEVERAGES: Completed orders grouped by menu category ────────
    const orderItems = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: { hotelId, status: 'Completed', ...createdAtFilter },
          attributes: ['id', 'orderType', 'createdAt']
        },
        {
          model: MenuItem,
          attributes: ['id', 'name', 'price'],
          include: [{
            model: MenuCategory,
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    // Build per-category aggregation
    const categoryMap = {};
    const foodRows = [];

    for (const item of orderItems) {
      const catId = item.MenuItem?.MenuCategory?.id || 'uncategorized';
      const catName = item.MenuItem?.MenuCategory?.name || 'Uncategorized';
      const itemName = item.MenuItem?.name || 'Unknown';
      const qty = parseInt(item.quantity) || 0;
      const price = parseFloat(item.MenuItem?.price || 0);
      const lineTotal = qty * price;

      if (!categoryMap[catId]) {
        categoryMap[catId] = { categoryId: catId, categoryName: catName, totalQty: 0, totalRevenue: 0, items: {} };
      }
      categoryMap[catId].totalQty += qty;
      categoryMap[catId].totalRevenue += lineTotal;

      if (!categoryMap[catId].items[itemName]) {
        categoryMap[catId].items[itemName] = { name: itemName, qty: 0, revenue: 0 };
      }
      categoryMap[catId].items[itemName].qty += qty;
      categoryMap[catId].items[itemName].revenue += lineTotal;

      foodRows.push({
        orderId: item.Order?.id,
        orderType: item.Order?.orderType,
        date: item.Order?.createdAt,
        category: catName,
        itemName,
        quantity: qty,
        unitPrice: price,
        lineTotal
      });
    }

    const categories = Object.values(categoryMap).map(c => ({
      ...c,
      items: Object.values(c.items)
    }));

    // Determine which are food vs beverage by category name heuristics
    // (Hotels can name categories freely; we split by checking for 'bever' / 'drink' / 'bar')
    const beverageKeywords = /bever|drink|bar|juice|water|soft|beverage/i;
    const beverageCategories = categories.filter(c => beverageKeywords.test(c.categoryName));
    const foodCategories = categories.filter(c => !beverageKeywords.test(c.categoryName));

    // Summary totals
    const roomRevenue = roomRows.reduce((s, r) => s + r.totalAmount, 0);
    const foodRevenue = foodCategories.reduce((s, c) => s + c.totalRevenue, 0);
    const beverageRevenue = beverageCategories.reduce((s, c) => s + c.totalRevenue, 0);

    // Breakdown for room billing vs direct
    const roomBilledOrders = orderItems.filter(item => 
      item.Order?.orderType === 'Room Service' || item.Order?.orderType === 'Charge to Room'
    ).reduce((sum, item) => sum + (parseFloat(item.MenuItem?.price || 0) * parseInt(item.quantity || 0)), 0);

    const directPaymentOrders = (foodRevenue + beverageRevenue) - roomBilledOrders;

    res.status(200).json({
      totals: {
        roomRevenue,
        foodRevenue,
        beverageRevenue,
        orderRevenue: foodRevenue + beverageRevenue,
        totalRevenue: roomRevenue + foodRevenue + beverageRevenue,
        roomBilledOrders,
        directPaymentOrders
      },
      rooms: roomRows,
      foodRows,
      categories,
      foodCategories,
      beverageCategories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRevenueTrend = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: 'Hotel ID is required' });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get all bookings from last 30 days
    const bookings = await Booking.findAll({
      where: {
        hotelId,
        status: { [Op.in]: ['Checked In', 'Checked Out'] },
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      attributes: ['totalAmount', 'createdAt']
    });

    // Get all orders from last 30 days
    const orders = await Order.findAll({
      where: {
        hotelId,
        status: 'Completed',
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      attributes: ['totalAmount', 'createdAt']
    });

    // Group by day
    const trendMap = {};
    for (let i = 0; i <= 30; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = 0;
    }

    bookings.forEach(b => {
      const dateStr = b.createdAt.toISOString().split('T')[0];
      if (trendMap[dateStr] !== undefined) trendMap[dateStr] += parseFloat(b.totalAmount);
    });

    orders.forEach(o => {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      if (trendMap[dateStr] !== undefined) trendMap[dateStr] += parseFloat(o.totalAmount);
    });

    const trendData = Object.keys(trendMap).map(date => ({
      date: date.split('-').slice(1).join('/'), // MM/DD
      revenue: trendMap[date]
    })).sort((a,b) => a.date.localeCompare(b.date));

    res.status(200).json(trendData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRoomOccupancy,
  getSalesSummary,
  getPopularItems,
  getRevenueSummary,
  getCategorySalesReport,
  getRevenueTrend
};
