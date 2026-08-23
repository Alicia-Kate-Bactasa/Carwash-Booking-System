const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/v1/admin/dashboard-stats
 * Returns summary stats for the Admin portal
 */
router.get('/dashboard-stats', requireAuth, requireAdmin, async (req, res) => {
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
