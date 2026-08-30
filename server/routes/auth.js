const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'montage_studio_jwt_secret_key_2026';

const getBodyData = (req) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e){}
  }
  return body || {};
};

/**
 * POST /api/v1/auth/register or /api/auth/register
 * Register a new member account
 */
router.post('/register', async (req, res) => {
  try {
    const body = getBodyData(req);
    const email = body.email || body.emailAddress;
    const password = body.password;
    const full_name = body.full_name || body.fullName || body.name;
    const phone_number = body.phone_number || body.phoneNumber || body.phone;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email address and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const username = full_name ? full_name.trim() : cleanEmail.split('@')[0];
    const userRole = (req.body.role === 'Admin' || cleanEmail.includes('admin')) ? 'Admin' : 'Customer';

    // Create user record in Prisma
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        username,
        password: hashedPassword,
        role: userRole
      }
    });

    // Create customer record if details provided
    if (full_name || phone_number) {
      await prisma.customer.create({
        data: {
          full_name: full_name ? full_name.trim() : username,
          phone_number: phone_number ? phone_number.trim() : 'N/A',
          email: cleanEmail,
          customer_type: 'Regular'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      status: 'success',
      message: 'Account created successfully.',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    const dbErr = error.message && (error.message.includes('Authentication failed') || error.message.includes('Prisma'));
    return res.status(500).json({
      status: 'error',
      message: dbErr 
        ? 'Database connection error. Please update DATABASE_URL in server/.env with your valid Neon PostgreSQL connection string.' 
        : (error.message || 'Failed to create account. Please try again.')
    });
  }
});

/**
 * POST /api/v1/auth/login or /api/auth/login
 * Log in to member account
 */
router.post('/login', async (req, res) => {
  try {
    const body = getBodyData(req);
    const email = body.email || body.emailAddress;
    const password = body.password;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email address and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    const dbErr = error.message && (error.message.includes('Authentication failed') || error.message.includes('Prisma'));
    return res.status(500).json({
      status: 'error',
      message: dbErr 
        ? 'Database connection error. Please update DATABASE_URL in server/.env with your valid Neon PostgreSQL connection string.' 
        : (error.message || 'Failed to log in. Please try again.')
    });
  }
});

/**
 * GET /api/v1/auth/me or /api/auth/me
 * Get current authenticated user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.id },
      select: {
        user_id: true,
        email: true,
        username: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Auth Profile Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve profile.'
    });
  }
});

module.exports = router;
