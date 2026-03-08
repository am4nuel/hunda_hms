const { InventoryItem, Supplier, Unit, InventoryTransaction, sequelize } = require('../models');
const { logActivity } = require('../utils/activityLogger');

// ─── Inventory Items ─────────────────────────────────────────────────────────

exports.getAllItems = async (req, res) => {
  try {
    const { hotelId } = req.query;
    if (!hotelId) return res.status(400).json({ message: 'hotelId is required' });

    const items = await InventoryItem.findAll({
      where: { hotelId },
      include: [
        { model: Supplier, as: 'supplier', attributes: ['name'] },
        { model: Unit, as: 'Unit', attributes: ['name', 'abbreviation'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    await logActivity({
      action: 'CREATE_ITEM',
      module: 'Inventory',
      details: `Created item: ${item.name}`,
      userId: req.user?.id || req.body.userId,
      hotelId: item.hotelId,
      req
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const oldStock = item.currentStock;
    await item.update(req.body);
    
    // Log Manual Adjustment if stock changed
    if (req.body.currentStock !== undefined && req.body.currentStock !== oldStock) {
      await InventoryTransaction.create({
        inventoryItemId: item.id,
        changeAmount: req.body.currentStock - oldStock,
        type: 'Manual_Adjustment',
        hotelId: item.hotelId,
        notes: req.body.reason || 'Manual stock update'
      });
    }

    await logActivity({
      action: 'UPDATE_ITEM',
      module: 'Inventory',
      details: `Updated item: ${item.name}`,
      userId: req.user?.id || req.body.userId,
      hotelId: item.hotelId,
      req
    });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Restock an inventory item
// @route   POST /api/inventory/:id/restock
exports.restockItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { quantity, costPrice, supplierId, notes } = req.body;
    
    const item = await InventoryItem.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const updatedStock = parseFloat(item.currentStock) + parseFloat(quantity);
    
    // Update item
    const updateData = { currentStock: updatedStock };
    if (costPrice) updateData.costPrice = costPrice;
    if (supplierId) updateData.supplierId = supplierId;
    
    await item.update(updateData, { transaction });

    // Log Transaction
    await InventoryTransaction.create({
      inventoryItemId: item.id,
      changeAmount: quantity,
      type: 'Restock',
      hotelId: item.hotelId,
      notes: notes || 'Restock'
    }, { transaction });

    await transaction.commit();
    res.json(item);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get inventory transactions
// @route   GET /api/inventory/:id/transactions
exports.getItemTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await InventoryTransaction.findAll({
      where: { inventoryItemId: id },
      order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory transactions for a hotel
// @route   GET /api/inventory/transactions/all
exports.getAllTransactions = async (req, res) => {
  try {
    const { hotelId } = req.query;
    if (!hotelId) return res.status(400).json({ message: 'hotelId is required' });

    const transactions = await InventoryTransaction.findAll({
      where: { hotelId },
      include: [{ model: InventoryItem, as: 'inventoryItem', attributes: ['name', 'unit'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const itemName = item.name;
    const hId = item.hotelId;
    await item.destroy();
    await logActivity({
      action: 'DELETE_ITEM',
      module: 'Inventory',
      details: `Deleted item: ${itemName}`,
      userId: req.user?.id,
      hotelId: hId,
      req
    });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Suppliers ──────────────────────────────────────────────────────────────

exports.getAllSuppliers = async (req, res) => {
  try {
    const { hotelId } = req.query;
    if (!hotelId) return res.status(400).json({ message: 'hotelId is required' });

    const suppliers = await Supplier.findAll({
      where: { hotelId },
      order: [['name', 'ASC']]
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    await logActivity({
      action: 'CREATE_SUPPLIER',
      module: 'Supplier',
      details: `Created supplier: ${supplier.name}`,
      userId: req.user?.id || req.body.userId,
      hotelId: supplier.hotelId,
      req
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    await supplier.update(req.body);
    await logActivity({
      action: 'UPDATE_SUPPLIER',
      module: 'Supplier',
      details: `Updated supplier: ${supplier.name}`,
      userId: req.user?.id || req.body.userId,
      hotelId: supplier.hotelId,
      req
    });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    const supName = supplier.name;
    const hId = supplier.hotelId;
    await supplier.destroy();
    await logActivity({
      action: 'DELETE_SUPPLIER',
      module: 'Supplier',
      details: `Deleted supplier: ${supName}`,
      userId: req.user?.id,
      hotelId: hId,
      req
    });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
