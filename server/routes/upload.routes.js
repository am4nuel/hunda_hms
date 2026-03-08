const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateApiKey } = require('../middleware/api.middleware');

const authMiddleware = (req, res, next) => {
  if (req.header('X-API-KEY')) {
    return validateApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

// @desc    Upload multiple images
// @route   POST /api/upload
router.post('/', authMiddleware, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ urls: fileUrls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
