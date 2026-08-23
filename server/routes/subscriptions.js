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
 * Get current user's subscription profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const dbUser = await prisma.user.upsert({
      where: { email: req.user.email },
      update: {},
      create: {
        email: req.user.email,
        username: req.user.email.split('@')[0] + '-' + Date.now().toString(36),
        password: 'supabase-managed',
        role: 'Customer'
      }
    });

    const subscription = await prisma.subscription.findFirst({
      where: { user_id: dbUser.user_id },
      include: { invoices: { include: { payments: true } } },
      orderBy: { subscription_id: 'desc' }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        user: dbUser,
        subscription: subscription || null
      }
    });
  } catch (error) {
    console.error('Error fetching subscription profile:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve subscription profile.' });
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
