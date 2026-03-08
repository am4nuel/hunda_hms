const { Order, OrderItem, MenuItem, MenuCategory, Booking, Guest, DiningTable, Room, RecipeIngredient, InventoryItem, Unit, InventoryTransaction, sequelize } = require('../models');
const { getIO } = require('../utils/socket');

// @desc    Get all orders for a hotel (supports ?userId= filter for website guests)
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });

    const where = { hotelId };
    if (req.query.userId) where.userId = req.query.userId;

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          include: [{ model: MenuItem, attributes: ['name', 'price', 'image'] }]
        },
        {
          model: Booking,
          include: [
            { model: Guest, attributes: ['firstName', 'lastName'] },
            { model: Room, attributes: ['roomNumber'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper for checking stock availability
const checkStockAvailability = async (items) => {
  for (const item of items) {
    const menuItem = await MenuItem.findByPk(item.menuItemId, {
      include: [{ model: RecipeIngredient, as: 'recipeIngredients' }]
    });
    if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
    if (menuItem.availability === false) throw new Error(`${menuItem.name} is currently sold out.`);

    // Check Recipes
    if (menuItem.recipeIngredients && menuItem.recipeIngredients.length > 0) {
      for (const recipeIng of menuItem.recipeIngredients) {
        const invItem = await InventoryItem.findByPk(recipeIng.inventoryItemId);
        if (invItem) {
          const totalNeeded = parseFloat(recipeIng.quantityRequired) * item.quantity;
          if (parseFloat(invItem.currentStock) < totalNeeded) {
            throw new Error(`Insufficient stock for ingredient: ${invItem.name}. Need ${totalNeeded}${invItem.unit}, available ${invItem.currentStock}${invItem.unit}`);
          }
        }
      }
    } 
    // Fallback to legacy
    else if (menuItem.inventoryItemId) {
      const invItem = await InventoryItem.findByPk(menuItem.inventoryItemId);
      if (invItem && invItem.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${menuItem.name}. Available: ${invItem.currentStock}`);
      }
    }
  }
};

// Helper for deducting stock with unit conversion support
const deductStockForOrder = async (orderId, hotelId, transaction = null) => {
  const options = transaction ? { transaction } : {};
  const orderItems = await OrderItem.findAll({
    where: { orderId },
    include: [
      { 
        model: MenuItem, 
        include: [{ 
          model: RecipeIngredient, 
          as: 'recipeIngredients',
          include: [{ model: Unit, as: 'Unit' }] 
        }] 
      }
    ],
    ...options
  });

  for (const item of orderItems) {
    const menuItem = item.MenuItem;
    const orderQty = item.quantity;

    if (menuItem.recipeIngredients && menuItem.recipeIngredients.length > 0) {
      for (const recipeIng of menuItem.recipeIngredients) {
        const invItem = await InventoryItem.findByPk(recipeIng.inventoryItemId, {
          include: [{ model: Unit, as: 'Unit' }],
          ...options
        });

        if (invItem) {
          const recipeUnit = recipeIng.Unit;
          const invUnit = invItem.Unit;
          
          let conversionMultiplier = 1;
          
          // Unit Conversion Logic
          if (recipeUnit && invUnit && recipeUnit.id !== invUnit.id) {
            // If they share the same category (Weight, Volume, etc.)
            if (recipeUnit.category === invUnit.category && recipeUnit.category !== 'Other') {
              const recipeFactor = parseFloat(recipeUnit.conversionFactor || 1);
              const invFactor = parseFloat(invUnit.conversionFactor || 1);
              conversionMultiplier = recipeFactor / invFactor;
            }
          }

          const totalNeeded = parseFloat(recipeIng.quantityRequired) * orderQty * conversionMultiplier;
          const updatedStock = parseFloat(invItem.currentStock) - totalNeeded;
          
          await invItem.update({ currentStock: updatedStock }, options);
          
          await InventoryTransaction.create({
            inventoryItemId: invItem.id,
            changeAmount: -totalNeeded,
            type: 'Order_Usage',
            referenceId: `Order-${orderId}`,
            hotelId,
            notes: `Auto-deduction for ${menuItem.name} (x${orderQty}). [${recipeIng.quantityRequired} ${recipeUnit?.abbreviation || ''} each]` + 
                   (conversionMultiplier !== 1 ? ` Converted to ${invUnit?.abbreviation || ''}` : '')
          }, options);

          if (updatedStock <= invItem.lowStockThreshold) {
            getIO().emit('lowStockAlert', {
              itemId: invItem.id,
              name: invItem.name,
              currentStock: updatedStock,
              threshold: invItem.lowStockThreshold,
              hotelId: invItem.hotelId
            });
          }
        }
      }
    } else if (menuItem.inventoryItemId) {
      // Legacy support
      const invItem = await InventoryItem.findByPk(menuItem.inventoryItemId, options);
      if (invItem) {
        const updatedStock = invItem.currentStock - orderQty;
        await invItem.update({ currentStock: updatedStock }, options);
        
        await InventoryTransaction.create({
          inventoryItemId: invItem.id,
          changeAmount: -orderQty,
          type: 'Order_Usage',
          referenceId: `Order-${orderId}`,
          hotelId,
          notes: `Auto-deduction for ${menuItem.name} (x${orderQty})`
        }, options);

        if (updatedStock <= invItem.lowStockThreshold) {
          getIO().emit('lowStockAlert', {
            itemId: invItem.id,
            name: invItem.name,
            currentStock: updatedStock,
            threshold: invItem.lowStockThreshold,
            hotelId: invItem.hotelId
          });
        }
      }
    }
  }
};

// @desc    Create a new order
// @route   POST /api/orders
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { tableNumber, orderType, bookingId, guestName, phone, items, userId, paymentType } = req.body;

    // ── Validations ─────────────────────────────────────────────────────────
    if (orderType === 'Room Service' || orderType === 'Charge to Room') {
      if (!bookingId) throw new Error(`${orderType} requires a room number or booking ID.`);
      
      let booking;

      // 1. Try finding by Room Number (string) for ACTIVE (Checked In) stays
      booking = await Booking.findOne({
        where: { hotelId, status: 'Checked In' },
        include: [{
          model: Room,
          where: { roomNumber: String(bookingId) },
          attributes: ['roomNumber']
        }]
      });

      // 2. Fallback: Try finding by internal Booking ID if numeric
      if (!booking && /^\d+$/.test(bookingId)) {
        booking = await Booking.findOne({
          where: { id: parseInt(bookingId), hotelId },
          include: [{ model: Room, attributes: ['roomNumber'] }]
        });
      }

      if (!booking) {
        throw new Error(`Active stay not found for "${bookingId}". Only checked-in guests can use ${orderType}.`);
      }
      
      req.body.bookingId = booking.id;
    }

    if (orderType === 'Dine-in') {
      if (!tableNumber) throw new Error('A table number is required for Dine-in orders.');
      
      const table = await DiningTable.findOne({
        where: { number: tableNumber, hotelId }
      });

      if (!table) {
        throw new Error(`Table "${tableNumber}" was not found. Please double-check the number on your table.`);
      }
      
      if (table.status === 'OutOfService') {
        throw new Error(`Table ${tableNumber} is currently out of service. Please choose another table or contact staff.`);
      }
    }

    // Sanitize inputs
    const sanitizedTableNumber = tableNumber === '' ? null : tableNumber;
    // Use the potentially resolved bookingId from req.body (e.g. from room number lookup)
    const resolvedBookingId = req.body.bookingId || bookingId;
    const sanitizedBookingId = (resolvedBookingId === '' || !resolvedBookingId) ? null : parseInt(resolvedBookingId);

    // ── Pre-flight Stock Check ──────────────────────────────────────────
    await checkStockAvailability(items);

    let totalAmount = 0;
    const orderItemsData = [];

    // Calculate total and prepare items
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      const price = parseFloat(menuItem.price);
      totalAmount += price * item.quantity;
      
      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        priceAtOrder: price,
        notes: item.notes
      });
    }

    // ── Pre-flight User Discovery (Link historic data if local storage cleared) ──
    let finalUserId = userId;
    if (phone) {
      const { normalizePhone } = require('../utils/phone');
      const normalizedPhone = normalizePhone(phone);
      // Try to find if this phone belongs to a historic guest profile
      const historicGuest = await Guest.findOne({ 
        where: { phone: normalizedPhone, hotelId }
      });
      if (historicGuest && historicGuest.userId) {
        finalUserId = historicGuest.userId;
      }
    }

    // Backwards compatibility for legacy orderType "Charge to Room"
    const isChargeToRoom = orderType === 'Charge to Room' || orderType === 'Room Service';
    const finalPaymentType = paymentType || (isChargeToRoom ? 'Charge to Room' : 'Pay Now');

    const order = await Order.create({
      tableNumber: sanitizedTableNumber,
      orderType,
      bookingId: sanitizedBookingId,
      guestName: guestName || null,
      phone: phone || null,
      totalAmount,
      hotelId,
      status: 'Pending',
      userId: finalUserId,
      paymentType: finalPaymentType
    }, { transaction });

    await Promise.all(orderItemsData.map(item => 
      OrderItem.create({ ...item, orderId: order.id }, { transaction })
    ));

    await transaction.commit();

    // Fetch full order to return and emit
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: [{ model: MenuItem, attributes: ['name', 'price', 'image'] }]
        },
        {
          model: Booking,
          include: [{ model: Guest, attributes: ['firstName', 'lastName'] }]
        }
      ]
    });

    // Notify kitchen/staff via socket
    getIO().emit('newOrder', fullOrder);

    res.status(201).json(fullOrder);
  } catch (error) {
    console.error('CREATE ORDER ERROR:', error);
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ where: { id, hotelId } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    await order.update({ status });

    // ── Inventory Deduction Logic ───────────────────────────────────────────
    // Trigger on 'In Progress' (Accepted) or 'Completed' (Legacy/Fallback)
    if (!order.stockDeducted && (status === 'In Progress' || status === 'Completed')) {
      await deductStockForOrder(order.id, hotelId);
      await order.update({ stockDeducted: true });
    }

    // Emit real-time update
    getIO().emit('orderStatusUpdate', { 
      id: order.id, 
      status, 
      userId: order.userId 
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
const cancelOrder = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.hotelId || req.query.hotelId;
    if (!hotelId) return res.status(400).json({ message: "Hotel ID is required" });
    const { id } = req.params;

    const order = await Order.findOne({ where: { id, hotelId } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ 
        message: `Cannot cancel order. It is already ${order.status.toLowerCase()}.` 
      });
    }

    await order.update({ status: 'Cancelled' });
    
    getIO().emit('orderStatusUpdate', { id: order.id, status: 'Cancelled' });

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus,
  cancelOrder
};
