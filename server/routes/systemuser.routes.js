const express = require('express');
const router = express.Router();
const systemUserController = require('../controllers/systemuser.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', systemUserController.getSystemUsers);
router.post('/', systemUserController.createSystemUser);
router.put('/:id', systemUserController.updateSystemUser);
router.delete('/:id', systemUserController.deleteSystemUser);

module.exports = router;
