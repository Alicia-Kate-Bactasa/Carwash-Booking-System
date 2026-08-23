const supabaseAdmin = require('../config/supabaseAdmin');

/**
 * Authentication Middleware
 * Verifies the Supabase JWT token passed in the Authorization header: Bearer <token>
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authorization header missing or invalid. Format: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!supabaseAdmin) {
      // Development fallback if Supabase environment variables aren't initialized yet
      req.user = { id: 'dev-user-id', email: 'dev@montage.com', role: 'Admin' };
      return next();
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired authentication token.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || user.role || 'Customer'
    };

    next();
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
