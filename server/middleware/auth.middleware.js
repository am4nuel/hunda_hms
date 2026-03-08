const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = decoded; // Attach full decoded token (contains hotelId, role, etc.)
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Require Admin Role!' });
  }
  next();
};

const isHotelAdmin = (req, res, next) => {
  if (req.userRole !== 'hotel_admin' && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Require Hotel Admin Role!' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isHotelAdmin
};
