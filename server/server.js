/**
 * Main Express backend server entrypoint for Montage Auto Studio.
 * Initializes core security middleware, API route handlers, health check, global error handling, and HTTP listener.
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for system monitoring
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'Montage Auto Studio API',
    timestamp: new Date().toISOString()
  });
});

// API v1 router mounts
app.use('/api/v1/auth', authRouter);
app.use('/api/auth', authRouter);
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
  return res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.originalUrl} not found.`
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

