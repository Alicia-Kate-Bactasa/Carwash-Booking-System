const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'montage_studio_jwt_secret_key_2026';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL SECURITY WARNING: JWT_SECRET environment variable is missing in production!');
}

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

const { sendOtpEmail } = require('../services/mailer');

/**
 * POST /api/v1/auth/forgot-password
 * Generates 6-digit OTP and sends via email for password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const body = getBodyData(req);
    const email = (body.email || body.emailAddress || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Valid email address is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success message to avoid email enumeration attacks
      return res.status(200).json({
        status: 'success',
        message: 'If the email exists, a 6-digit verification code has been sent.'
      });
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    // Record security action token in database
    await prisma.userSecurityAction.create({
      data: {
        user_id: user.user_id,
        action_type: 'password_reset',
        ip_address: req.ip || '127.0.0.1',
        identifier: email,
        token: otpCode,
        expires_at: expiresAt
      }
    });

    // Send email with Nodemailer / Gmail SMTP
    await sendOtpEmail({ to: email, otp: otpCode, type: 'Password Reset' });

    return res.status(200).json({
      status: 'success',
      message: 'A 6-digit verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to process password reset request.' });
  }
});

/**
 * POST /api/v1/auth/verify-otp
 * Verifies 6-digit OTP code validity
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const body = getBodyData(req);
    const email = (body.email || '').trim().toLowerCase();
    const otp = (body.otp || body.token || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ status: 'error', message: 'Email address and OTP code are required.' });
    }

    const action = await prisma.userSecurityAction.findFirst({
      where: {
        identifier: email,
        token: otp,
        action_type: 'password_reset',
        expires_at: { gte: new Date() }
      },
      orderBy: { action_id: 'desc' }
    });

    if (!action) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired 6-digit verification code.' });
    }

    return res.status(200).json({ status: 'success', message: 'OTP verification code is valid.' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to verify code.' });
  }
});

/**
 * POST /api/v1/auth/reset-password
 * Resets user password using verified 6-digit OTP code
 */
router.post('/reset-password', async (req, res) => {
  try {
    const body = getBodyData(req);
    const email = (body.email || '').trim().toLowerCase();
    const otp = (body.otp || body.token || '').trim();
    const newPassword = body.newPassword || body.password;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Email, OTP code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters long.' });
    }

    const action = await prisma.userSecurityAction.findFirst({
      where: {
        identifier: email,
        token: otp,
        action_type: 'password_reset',
        expires_at: { gte: new Date() }
      },
      orderBy: { action_id: 'desc' }
    });

    if (!action) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired verification code.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password: hashedPassword }
    });

    // Delete used security action
    await prisma.userSecurityAction.delete({ where: { action_id: action.action_id } }).catch(() => {});

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successful. You may now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to reset password.' });
  }
});

module.exports = router;
