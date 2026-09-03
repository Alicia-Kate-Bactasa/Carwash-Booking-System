/**
 * Authentication & Authorization Middleware module for Montage Auto Studio.
 * Verifies JSON Web Tokens (JWT) for protected client routes and enforces role-based access control (Admin).
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

/**
 * Authentication Middleware:
 * Inspects incoming request headers for a Bearer JWT token.
 * Decodes user details (id, email, role) and attaches them to req.user upon successful verification.
 */
const requireAuth = (req, res, next) => {
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
};

/**
 * Role-Based Access Control Middleware:
 * Ensures the authenticated user possesses administrative privileges (Admin role).
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
