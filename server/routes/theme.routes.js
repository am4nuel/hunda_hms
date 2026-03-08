const express = require('express');
const router = express.Router();
const themeController = require('../controllers/theme.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

// Publicly accessible via API Key OR Protected via JWT Token
router.get('/', (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
}, themeController.getAllThemes);
router.post('/', verifyToken, themeController.createTheme);
router.put('/:id', verifyToken, themeController.updateTheme);
router.delete('/:id', verifyToken, themeController.deleteTheme);

module.exports = router;
