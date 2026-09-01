/**
 * Admin Management API Router for Montage Auto Studio.
 * Provides endpoints for administrative booking management, invoice history retrieval,
 * subscription roster monitoring, walk-in counter booking creation, and dashboard statistics.
 */

const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Protect ALL admin routes with authentication + admin role check
router.use(requireAuth, requireAdmin);

/**
 * GET /api/v1/admin/bookings
 * Retrieves all customer bookings with associated service, customer, and user data.
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
 * Update booking status and send HTML notification email
 */
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { booking_status, reason } = req.body;

    const VALID_STATUSES = ['Pending', 'Pending_Verification', 'Confirmed', 'Completed', 'Cancelled', 'No_Show', 'Paid', 'Scheduled'];
    if (!booking_status || !VALID_STATUSES.includes(booking_status)) {
      return res.status(400).json({
        status: 'error',
        message: `booking_status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const updated = await prisma.booking.update({
      where: { booking_id: bookingId },
      data: { booking_status },
      include: {
        service: true,
        customer: true,
        user: true,
        invoices: true
      }
    });

    const recipientEmail = updated.customer?.email || updated.user?.email;
    const recipientName = updated.customer?.full_name || updated.user?.username;
    const invoiceId = updated.invoices[0]?.invoice_id || bookingId;

    if (recipientEmail) {
      const { sendAdminCompleteBookingEmail, sendAdminCancelBookingEmail } = require('../services/mailer');
      if (booking_status === 'Completed') {
        sendAdminCompleteBookingEmail({
          to: recipientEmail,
          clientName: recipientName,
          bookingId: updated.booking_id,
          invoiceId,
          serviceName: updated.service?.service_name
        }).catch(e => console.error('Admin Complete Email Error:', e));
      } else if (booking_status === 'Cancelled') {
        sendAdminCancelBookingEmail({
          to: recipientEmail,
          clientName: recipientName,
          bookingId: updated.booking_id,
          invoiceId,
          serviceName: updated.service?.service_name,
          reason
        }).catch(e => console.error('Admin Cancel Email Error:', e));
      }
    }

    return res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update booking status.' });
  }
});

/**
 * POST /api/v1/admin/walkin
 * Admin creates completed walk-in booking form
 */
router.post('/walkin', async (req, res) => {
  try {
    const { full_name, phone_number, email, service_id, scheduled_date, time_slot, price } = req.body;

    if (!full_name || !service_id) {
      return res.status(400).json({ status: 'error', message: 'full_name and service_id are required.' });
    }

    const service = await prisma.service.findUnique({ where: { service_id: parseInt(service_id, 10) } });
    const finalPrice = parseFloat(price) || service?.service_price || 250.00;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Walk-In Customer
      const customer = await tx.customer.create({
        data: {
          full_name,
          phone_number: phone_number || 'Walk-In Counter',
          email: email || null,
          customer_type: 'Walk_In',
          booking_count: 1
        }
      });

      // 2. Create Booking
      const booking = await tx.booking.create({
        data: {
          customer_id: customer.customer_id,
          service_id: parseInt(service_id, 10),
          scheduled_date: scheduled_date ? new Date(scheduled_date) : new Date(),
          time_slot: time_slot || 'Walk-In Immediate',
          bay_number: 1,
          purchased_price: finalPrice,
          booking_status: 'Completed'
        }
      });

      // 3. Create Paid Invoice
      const invoice = await tx.invoice.create({
        data: {
          booking_id: booking.booking_id,
          total_amount: finalPrice,
          invoice_type: 'Single_Detailing',
          invoice_status: 'Paid'
        }
      });

      // 4. Create Payment
      await tx.payment.create({
        data: {
          invoice_id: invoice.invoice_id,
          amount: finalPrice,
          payment_method: 'Cash/Counter',
          proof_of_payment: 'ADMIN_WALKIN_PAID',
          payment_status: 'Paid'
        }
      });

      return { customer, booking, invoice };
    });

    if (email) {
      const { sendWalkInBookingEmail } = require('../services/mailer');
      sendWalkInBookingEmail({
        to: email,
        clientName: full_name,
        bookingId: result.booking.booking_id,
        invoiceId: result.invoice.invoice_id,
        serviceName: service?.service_name || 'Walk-In Detailing',
        scheduledDate: scheduled_date || 'Today',
        timeSlot: time_slot || 'Counter',
        price: finalPrice
      }).catch(e => console.error('Walk-In Email Error:', e));
    }

    return res.status(201).json({
      status: 'success',
      message: 'Walk-in booking created and receipt generated successfully.',
      data: result
    });
  } catch (error) {
    console.error('Error creating walk-in booking:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to log walk-in booking.' });
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
