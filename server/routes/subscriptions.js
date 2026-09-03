/**
 * VIP Subscriptions API Router for Montage Auto Studio.
 * Handles VIP membership roster monitoring, member status checks (/me),
 * subscription plan renewals, cancellations, reactivations, and admin status updates.
 */

const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/v1/subscriptions
 * Retrieves all subscriber accounts for admin monitoring.
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
 * Get current subscriber status & subscription details (requires authentication)
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const email = req.user.email.trim().toLowerCase();

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

    return res.status(200).json({
      status: 'success',
      data: {
        user: user || { email: email || null, username: 'VIP Member' },
        subscription
      }
    });
  } catch (error) {
    console.error('Error fetching subscription profile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve subscription profile.'
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
 * Cancel an active subscription. Users cancel their own account; admins may cancel any account.
 */
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const requesterEmail = req.user.email.trim().toLowerCase();
    const isAdmin = req.user.role === 'Admin';
    // Non-admin users may only cancel their own subscription
    const requestedEmail = isAdmin && req.body?.email
      ? String(req.body.email).trim().toLowerCase()
      : requesterEmail;

    // Account must exist to be cancelled
    const user = await prisma.user.findUnique({ where: { email: requestedEmail } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    if (!isAdmin && user.email.toLowerCase() !== requesterEmail) {
      return res.status(403).json({ status: 'error', message: 'You may only cancel your own subscription.' });
    }

    const sub = await prisma.subscription.findFirst({
      where: { user_id: user.user_id },
      orderBy: { subscription_id: 'desc' }
    });

    if (sub && sub.subscription_id) {
      await prisma.subscription.update({
        where: { subscription_id: sub.subscription_id },
        data: { plan_status: 'Cancellation_Pending' }
      }).catch(err => console.error('Subscription cancel DB update error:', err));
    }

    if (requestedEmail.includes('@')) {
      const { sendSubscriptionCancelledEmail } = require('../services/mailer');
      sendSubscriptionCancelledEmail({
        to: requestedEmail,
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
    return res.status(500).json({
      status: 'error',
      message: 'Failed to cancel subscription.'
    });
  }
});

/**
 * POST /api/v1/subscriptions/reactivate
 * Reactivate a subscription. Admin only. Members must pay via PayMongo checkout.
 */
router.post('/reactivate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const requesterEmail = req.user.email.trim().toLowerCase();
    const isAdmin = req.user.role === 'Admin';
    const requestedEmail = isAdmin && req.body?.email
      ? String(req.body.email).trim().toLowerCase()
      : requesterEmail;

    const user = await prisma.user.findUnique({ where: { email: requestedEmail } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    if (!isAdmin && user.email.toLowerCase() !== requesterEmail) {
      return res.status(403).json({ status: 'error', message: 'You may only reactivate your own subscription.' });
    }

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    let sub = await prisma.subscription.findFirst({
      where: { user_id: user.user_id },
      orderBy: { subscription_id: 'desc' }
    });

    if (sub && sub.subscription_id) {
      sub = await prisma.subscription.update({
        where: { subscription_id: sub.subscription_id },
        data: { plan_status: 'Active', last_billing_date: today, next_billing_date: nextMonth }
      }).catch(() => sub);
    } else {
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

    if (requestedEmail.includes('@')) {
      const { sendSubscriptionReactivatedEmail } = require('../services/mailer');
      sendSubscriptionReactivatedEmail({
        to: requestedEmail,
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
    return res.status(500).json({
      status: 'error',
      message: 'Failed to reactivate subscription.'
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
