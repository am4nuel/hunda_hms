const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Inventory Items
router.get('/items', verifyToken, inventoryController.getAllItems);
router.post('/items', verifyToken, inventoryController.createItem);
router.put('/items/:id', verifyToken, inventoryController.updateItem);
router.post('/items/:id/restock', verifyToken, inventoryController.restockItem);
router.get('/items/:id/transactions', verifyToken, inventoryController.getItemTransactions);
router.get('/transactions/all', verifyToken, inventoryController.getAllTransactions);
router.delete('/items/:id', verifyToken, inventoryController.deleteItem);

// Suppliers
router.get('/suppliers', verifyToken, inventoryController.getAllSuppliers);
router.post('/suppliers', verifyToken, inventoryController.createSupplier);
router.put('/suppliers/:id', verifyToken, inventoryController.updateSupplier);
router.delete('/suppliers/:id', verifyToken, inventoryController.deleteSupplier);

module.exports = router;
