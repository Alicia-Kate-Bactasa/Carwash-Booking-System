/**
 * Authentication & Security API Router for Montage Auto Studio.
 * Handles user login, registration pre-checkout with PayMongo, profile retrieval (/me),
 * and 6-digit OTP verification password reset functionality.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { sendOtpEmail } = require('../services/mailer');
const { JWT_SECRET } = require('../config');

/**
 * Safely parses request body data supporting both object and JSON string formats.
 */
const getBodyData = (req) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { /* ignore malformed body */ }
  }
  return body || {};
};

/**
 * Helper to initiate pre-registration checkout for ₱1,500 VIP Membership.
 * Stores payload temporarily in a server-side PendingRegistration record
 * WITHOUT creating User, Customer, Subscription, or Invoice records.
 * The checkout redirect carries only an opaque random token (no password hash).
 * Database records are created ONLY upon payment verification via /payments/verify.
 */
const handlePreRegistration = async (req, res) => {
  try {
    const body = getBodyData(req);
    const email = body.email || body.emailAddress;
    const password = body.password;
    const full_name = body.full_name || body.fullName || body.name;
    const phone_number = body.phone_number || body.phoneNumber || body.phone;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email address and password are required.' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify user does not already exist in database
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'An account with this email address already exists.' });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = full_name ? full_name.trim() : cleanEmail.split('@')[0];

    // Create an opaque, random registration token. The password hash is stored
    // server-side in PendingRegistration rather than embedded in a URL so it is
    // never exposed in query strings / proxy / browser logs.
    const regToken = crypto.randomBytes(32).toString('hex');

    await prisma.pendingRegistration.create({
      data: {
        token: regToken,
        email: cleanEmail,
        username,
        full_name: username,
        phone_number: phone_number ? phone_number.trim() : 'N/A',
        password_hash: hashedPassword,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000)
      }
    });

    const rawKey = process.env.PAYMONGO_SECRET_KEY || '';
    const paymongoKey = rawKey.trim();
    const baseReturnUrl = req.headers.referer || 'http://localhost:5173/';
    const cleanReturnUrl = baseReturnUrl.split('?')[0];
    const successUrl = `${cleanReturnUrl}?payment=success&reg_token=${regToken}`;
    const cancelUrl = `${cleanReturnUrl}?payment=cancel`;

    const isRealPaymongoKey = paymongoKey &&
      (paymongoKey.startsWith('sk_test_') || paymongoKey.startsWith('sk_live_')) &&
      !paymongoKey.includes('your_paymongo_secret_key');

    if (isRealPaymongoKey) {
      const authHeader = 'Basic ' + Buffer.from(paymongoKey + ':').toString('base64');
      const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          data: {
            attributes: {
              send_email_receipt: true,
              show_description: true,
              show_line_items: true,
              payment_method_types: ['gcash', 'paymaya', 'card', 'dob', 'grab_pay'],
              line_items: [
                {
                  currency: 'PHP',
                  amount: 150000,
                  description: 'VIP Membership Roster - Monthly Subscription',
                  name: 'VIP Membership Roster',
                  quantity: 1
                }
              ],
              success_url: successUrl,
              cancel_url: cancelUrl
            }
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.data?.attributes?.checkout_url) {
        return res.status(200).json({
          status: 'success',
          message: 'Pre-registration created. Complete payment to finalize account creation.',
          checkout_url: data.data.attributes.checkout_url
        });
      } else {
        const detail = data.errors?.[0]?.detail || 'PayMongo API Checkout Session creation failed.';
        return res.status(400).json({ status: 'error', message: `PayMongo API Error: ${detail}` });
      }
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Please insert your valid PayMongo Secret Key (sk_test_...) into server/.env file.'
      });
    }
  } catch (error) {
    console.error('Registration Pre-Checkout Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to initiate VIP membership registration checkout.' });
  }
};

router.post('/pre-register', handlePreRegistration);
router.post('/register', handlePreRegistration);

/**
 * POST /api/v1/auth/login
 * Log in to member account (credentials verified strictly against stored password hashes).
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

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user || !user.password) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email address or password.'
      });
    }

    // Verify password hash using bcrypt (supporting legacy $2y$ PHP hashes)
    let isPasswordValid = false;
    try {
      const normalizedHash = user.password.startsWith('$2y$')
        ? user.password.replace(/^\$2y\$/, '$2a$')
        : user.password;
      isPasswordValid = await bcrypt.compare(password, normalizedHash);
    } catch (e) {
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email address or password.'
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
    return res.status(500).json({
      status: 'error',
      message: 'Failed to log in. Please try again.'
    });
  }
});

/**
 * GET /api/v1/auth/me
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

    // Generate cryptographically secure 6-digit numeric OTP code
    const otpCode = crypto.randomInt(100000, 1000000).toString();
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
 * Resets user password ONLY after the 6-digit OTP has been verified.
 * Requires email, the verified OTP, and a new password.
 */
router.post('/reset-password', async (req, res) => {
  try {
    const body = getBodyData(req);
    const email = (body.email || '').trim().toLowerCase();
    const otp = (body.otp || body.token || '').trim();
    const newPassword = body.newPassword || body.password;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Email, OTP code and new password are required.' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters long.' });
    }

    // Require a valid, non-expired OTP before allowing the reset
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
      return res.status(400).json({ status: 'error', message: 'Invalid or expired verification code. Please request a new code.' });
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

    // Invalidate all used security actions for this email
    await prisma.userSecurityAction.deleteMany({ where: { identifier: email, action_type: 'password_reset' } }).catch(() => {});

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
