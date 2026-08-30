const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

/**
 * GET /api/v1/admin/bookings
 * Returns all customer bookings for admin management
 */
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
        customer: true,
        user: { select: { user_id: true, username: true, email: true } }
      },
      orderBy: { booking_id: 'desc' }
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve bookings.' });
  }
});

/**
 * GET /api/v1/admin/invoices
 * Returns payment ledgers and invoice records
 */
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        booking: { include: { service: true } },
        subscription: true,
        payments: true
      },
      orderBy: { invoice_id: 'desc' }
    });

    return res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching admin invoices:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve invoices.' });
  }
});

/**
 * GET /api/v1/admin/subscriptions
 * Returns VIP subscriptions roster
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: { select: { user_id: true, username: true, email: true } }
      },
      orderBy: { subscription_id: 'desc' }
    });

    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching admin subscriptions:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve subscriptions.' });
  }
});

/**
 * PUT /api/v1/admin/bookings/:id/status
 * Update booking status
 */
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { booking_status } = req.body;

    const updated = await prisma.booking.update({
      where: { booking_id: bookingId },
      data: { booking_status }
    });

    return res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update booking status.' });
  }
});

/**
 * GET /api/v1/admin/dashboard-stats
 * Returns summary stats for the Admin portal
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      activeSubscriptions,
      pendingPaymentsCount,
      paidInvoices
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { booking_status: { in: ['Pending', 'Pending_Verification'] } } }),
      prisma.subscription.count({ where: { plan_status: 'Active' } }),
      prisma.payment.count({ where: { payment_status: 'Pending_Approval' } }),
      prisma.invoice.aggregate({
        where: { invoice_status: 'Paid' },
        _sum: { total_amount: true }
      })
    ]);

    const totalRevenue = paidInvoices._sum.total_amount || 0;

    return res.status(200).json({
      status: 'success',
      data: {
        total_bookings: totalBookings,
        pending_bookings: pendingBookings,
        active_subscribers: activeSubscriptions,
        pending_payments: pendingPaymentsCount,
        total_revenue: totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve admin stats.' });
  }
});

module.exports = router;
