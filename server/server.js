/**
 * Main Express backend server entrypoint for Montage Auto Studio.
 * Initializes core security middleware, API route handlers, health check, global error handling, and HTTP listener.
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PORT, ALLOWED_ORIGINS, isProduction, NODE_ENV } = require('./config');

// Route module imports
const authRouter = require('./routes/auth');
const servicesRouter = require('./routes/services');
const bookingsRouter = require('./routes/bookings');
const paymentsRouter = require('./routes/payments');
const subscriptionsRouter = require('./routes/subscriptions');
const adminRouter = require('./routes/admin');
const feedbackRouter = require('./routes/feedback');

const app = express();
const API_PREFIX = '/api/v1';

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));

// Disable browser caching for API requests so state updates render live on spot
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Cors configuration. In development localhost origins are allowed; in
// production only explicitly configured origins are accepted. Credentials are
// only allowed alongside a matching origin.
const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5001'];
const allowedOrigins = isProduction ? ALLOWED_ORIGINS : [...new Set([...ALLOWED_ORIGINS, ...defaultDevOrigins])];

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests (curl, health checks) with no Origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Rate limiter for sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: 'error', message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Health check endpoint for system monitoring
app.get(`${API_PREFIX}/health`, (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'Montage Auto Studio API',
    timestamp: new Date().toISOString()
  });
});

// API v1 router mounts
app.use(`${API_PREFIX}/auth`, authLimiter, authRouter);
app.use(`${API_PREFIX}/services`, servicesRouter);
app.use(`${API_PREFIX}/bookings`, bookingsRouter);
app.use(`${API_PREFIX}/payments`, paymentsRouter);
app.use(`${API_PREFIX}/subscriptions`, subscriptionsRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);
app.use(`${API_PREFIX}/feedback`, feedbackRouter);

// Serve compiled Vue frontend static assets
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback non-API routes to client/dist/index.html for Vue Router (SPA history mode)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// 404 handler for unmatched API routes
app.use((req, res) => {
  return res.status(404).json({
    status: 'error',
    message: 'Endpoint not found.'
  });
});

// Global unhandled error middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'An internal server error occurred.'
  });
});

// Server listener start block
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Montage Auto Studio API Server running on http://localhost:${PORT} (${NODE_ENV})`);
  });
}

module.exports = app;
