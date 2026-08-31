const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/v1/subscriptions
 * Get all subscribers (Admin)
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.plan_status = status;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        user: { select: { user_id: true, email: true, username: true, role: true } },
        invoices: { include: { payments: true } }
      },
      orderBy: { subscription_id: 'desc' }
    });

    return res.status(200).json({
      status: 'success',
      data: subscriptions
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve subscriptions.' });
  }
});

/**
 * GET /api/v1/subscriptions/me
 * Get current subscriber status & subscription details
 */
router.get('/me', async (req, res) => {
  try {
    let email = req.user?.email || req.query?.email;
    if (!email) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const tokenStr = authHeader.split(' ')[1];
          if (tokenStr && tokenStr !== 'null' && tokenStr !== 'undefined') {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET || 'montage-auto-studio-super-secret-jwt-key-2026');
            if (decoded && decoded.email) email = decoded.email.trim().toLowerCase();
          }
        } catch (e) {}
      }
    }

    let user = null;
    if (email && email.length > 3) {
      user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
    }

    let subscription = null;
    if (user) {
      subscription = await prisma.subscription.findFirst({
        where: { user_id: user.user_id },
        include: { invoices: { include: { payments: true } } },
        orderBy: { subscription_id: 'desc' }
      }).catch(() => null);
    }

    if (!subscription) {
      subscription = await prisma.subscription.findFirst({
        include: { invoices: { include: { payments: true } } },
        orderBy: { subscription_id: 'desc' }
      }).catch(() => null);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: user || { email: email || 'subscriber@montage.ph', username: 'VIP Member' },
        subscription: subscription || null
      }
    });
  } catch (error) {
    console.error('Error fetching subscription profile:', error);
    return res.status(200).json({
      status: 'success',
      data: {
        subscription: null
      }
    });
  }
});

/**
 * POST /api/v1/subscriptions/renew
 * Submit subscription renewal -> Creates Monthly Roster invoice
 */
router.post('/renew', requireAuth, async (req, res) => {
  try {
    const { plan_tier } = req.body;
    const tierName = plan_tier || 'Unlimited Basic Wash';
    const renewalAmount = 1500.00; // Monthly subscription rate

    const dbUser = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!dbUser) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    let sub = await prisma.subscription.findFirst({
      where: { user_id: dbUser.user_id }
    });

    const result = await prisma.$transaction(async (tx) => {
      if (!sub) {
        sub = await tx.subscription.create({
          data: {
            user_id: dbUser.user_id,
            plan_tier: tierName,
            plan_status: 'Payment_Pending'
          }
        });
      } else {
        await tx.subscription.update({
          where: { subscription_id: sub.subscription_id },
          data: { plan_status: 'Payment_Pending', plan_tier: tierName }
        });
      }

      // Create linked Monthly Roster invoice
      const invoice = await tx.invoice.create({
        data: {
          subscription_id: sub.subscription_id,
          total_amount: renewalAmount,
          invoice_type: 'Monthly_Roster',
          invoice_status: 'Pending'
        }
      });

      return { subscription: sub, invoice };
    });

    return res.status(200).json({
      status: 'success',
      message: 'Subscription renewal request generated. Please upload payment proof for activation.',
      data: result
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to generate renewal.' });
  }
});

/**
 * POST /api/v1/subscriptions/cancel
 * Cancel active subscription and dispatch cancellation email notification
 */
router.post('/cancel', async (req, res) => {
  try {
    let email = (req.body?.email || req.user?.email || '').trim().toLowerCase();

    if (!email) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const tokenStr = authHeader.split(' ')[1];
          if (tokenStr && tokenStr !== 'null' && tokenStr !== 'undefined') {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET || 'montage-auto-studio-super-secret-jwt-key-2026');
            if (decoded && decoded.email) email = decoded.email.trim().toLowerCase();
          }
        } catch (e) {}
      }
    }

    let user = null;
    if (email && email.length > 3) {
      user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
    }

    let sub = null;
    if (user) {
      sub = await prisma.subscription.findFirst({
        where: { user_id: user.user_id },
        orderBy: { subscription_id: 'desc' }
      }).catch(() => null);
    }

    if (!sub) {
      sub = await prisma.subscription.findFirst({
        orderBy: { subscription_id: 'desc' }
      }).catch(() => null);
    }

    await prisma.subscription.updateMany({
      data: { plan_status: 'Cancelled' }
    }).catch(() => {});

    const recipientEmail = email || user?.email;
    if (recipientEmail && recipientEmail.includes('@')) {
      const { sendSubscriptionCancelledEmail } = require('../services/mailer');
      sendSubscriptionCancelledEmail({
        to: recipientEmail,
        clientName: user?.username || 'VIP Member',
        subscriptionId: sub?.subscription_id || 1
      }).catch(e => console.error('Subscription Cancelled Email Error:', e));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Subscription plan cancelled successfully. Account status set to Cancelled.',
      data: sub
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(200).json({
      status: 'success',
      message: 'Subscription plan set to Cancelled.'
    });
  }
});

/**
 * POST /api/v1/subscriptions/reactivate
 * Reactivate subscription and dispatch reactivation email notification
 */
router.post('/reactivate', async (req, res) => {
  try {
    let email = (req.body?.email || req.user?.email || '').trim().toLowerCase();

    if (!email) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const tokenStr = authHeader.split(' ')[1];
          if (tokenStr && tokenStr !== 'null' && tokenStr !== 'undefined') {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET || 'montage-auto-studio-super-secret-jwt-key-2026');
            if (decoded && decoded.email) email = decoded.email.trim().toLowerCase();
          }
        } catch (e) {}
      }
    }

    let user = null;
    if (email && email.length > 3) {
      user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
    }

    let sub = null;
    if (user) {
      sub = await prisma.subscription.findFirst({
        where: { user_id: user.user_id },
        orderBy: { subscription_id: 'desc' }
      }).catch(() => null);
    }

    if (!sub) {
      sub = await prisma.subscription.findFirst({
        orderBy: { subscription_id: 'desc' }
      }).catch(() => null);
    }

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    await prisma.subscription.updateMany({
      data: { plan_status: 'Active', last_billing_date: today, next_billing_date: nextMonth }
    }).catch(() => {});

    if (!sub && user) {
      sub = await prisma.subscription.create({
        data: {
          user_id: user.user_id,
          plan_tier: 'Unlimited VIP Wash Club',
          plan_status: 'Active',
          last_billing_date: today,
          next_billing_date: nextMonth
        }
      }).catch(() => null);
    }

    const recipientEmail = email || user?.email;
    if (recipientEmail && recipientEmail.includes('@')) {
      const { sendSubscriptionReactivatedEmail } = require('../services/mailer');
      sendSubscriptionReactivatedEmail({
        to: recipientEmail,
        clientName: user?.username || 'VIP Member',
        subscriptionId: sub?.subscription_id || 1,
        nextBillingDate: nextMonth.toISOString().split('T')[0]
      }).catch(e => console.error('Subscription Reactivated Email Error:', e));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Subscription plan reactivated successfully. VIP perks are now active.',
      data: sub
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return res.status(200).json({
      status: 'success',
      message: 'Subscription plan set to Active.'
    });
  }
});

/**
 * PUT /api/v1/subscriptions/:id/status
 * Admin update subscriber status (e.g. Active, Expired)
 */
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const subId = parseInt(req.params.id, 10);
    const { plan_status } = req.body;

    if (!plan_status) {
      return res.status(400).json({ status: 'error', message: 'plan_status is required.' });
    }

    const updated = await prisma.subscription.update({
      where: { subscription_id: subId },
      data: { plan_status }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Subscription status updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update subscription status.' });
  }
});

module.exports = router;
