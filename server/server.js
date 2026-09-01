/**
 * Main Express backend server entrypoint for Montage Auto Studio.
 * Initializes core security middleware, API route handlers, health check, global error handling, and HTTP listener.
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Robustly load environment variables from server/.env or root .env
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '../.env'),
  path.join(process.cwd(), 'server/.env'),
  path.join(process.cwd(), '.env')
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
}

// Route module imports
const authRouter = require('./routes/auth');
const servicesRouter = require('./routes/services');
const bookingsRouter = require('./routes/bookings');
const paymentsRouter = require('./routes/payments');
const subscriptionsRouter = require('./routes/subscriptions');
const adminRouter = require('./routes/admin');
const feedbackRouter = require('./routes/feedback');

// Application setup and port configuration
const app = express();
const PORT = process.env.PORT || 5001;

// Security configuration and body parsing middleware
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.ALLOWED_ORIGIN || '']
  : ['http://localhost:5173', 'http://localhost:5001'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiter for sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: 'error', message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Health check endpoint for system monitoring
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'Montage Auto Studio API',
    timestamp: new Date().toISOString()
  });
});

// API v1 router mounts
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/v1/services', servicesRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/feedbacks', feedbackRouter);

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
  const safeUrl = encodeURIComponent(req.originalUrl || '');
  return res.status(404).json({
    status: 'error',
    message: `Endpoint not found.`
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
    console.log(`🚀 Montage Auto Studio API Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

