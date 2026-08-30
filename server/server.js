const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/auth');
const servicesRouter = require('./routes/services');
const bookingsRouter = require('./routes/bookings');
const paymentsRouter = require('./routes/payments');
const subscriptionsRouter = require('./routes/subscriptions');
const adminRouter = require('./routes/admin');
const feedbackRouter = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5001;

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'Montage Auto Studio API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/auth', authRouter);
app.use('/api/v1/services', servicesRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/feedback', feedbackRouter);

// 404 Handler
app.use((req, res) => {
  return res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  return res.status(500).json({
    status: 'error',
    message: 'An internal server error occurred.'
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Montage Auto Studio API Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
