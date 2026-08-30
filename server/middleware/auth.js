const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'montage_studio_jwt_secret_key_2026';

/**
 * Authentication Middleware
 * Verifies JWT token passed in Authorization header: Bearer <token>
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authorization token missing or invalid. Format: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'Customer'
      };
      return next();
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired authentication token.'
      });
    }
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal authentication error.'
    });
  }
};

/**
 * Require Admin Role Middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden. Administrative access required.'
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
