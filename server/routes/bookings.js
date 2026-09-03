/**
 * Booking Management API Router for Montage Auto Studio.
 * Handles appointment slot checking, regular guest bookings, ₱0.00 VIP member bookings,
 * booking rescheduling, status updates, and booking cancellations.
 */

const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const jwt = require('jsonwebtoken');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { JWT_SECRET } = require('../config');
const { z } = require('zod');

// Zod validation schema for booking creation payload
const createBookingSchema = z.object({
  body: z.object({
    service_id: z.number().int().positive('Valid service_id is required'),
    scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'scheduled_date must be YYYY-MM-DD'),
    time_slot: z.string().min(1, 'time_slot is required'),
    bay_number: z.number().int().positive().default(1),
    // Optional guest details if not signed in as a registered subscriber
    full_name: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().email().optional()
  })
});

/**
 * Optionally authenticates the requester from a Bearer token, returning the
 * decoded user claims or null when no valid token is present. Guest bookings
 * never trust a client-supplied user_id; subscriber benefits are only granted
 * to the authenticated account.
 */
const getOptionalUser = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded && decoded.userId) {
      return { id: decoded.userId, email: decoded.email, role: decoded.role };
    }
  } catch (e) { /* invalid token -> treat as guest */ }
  return null;
};


/**
 * GET /api/v1/user/bookings
 * Get current authenticated user's bookings list
 */
router.get('/user/bookings', requireAuth, async (req, res) => {
  try {
    const where = {};

    const dbUser = await prisma.user.findUnique({
      where: { email: req.user.email }
    }).catch(() => null);

    if (req.user.role !== 'Admin' && dbUser) {
      where.user_id = dbUser.user_id;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        customer: true
      },
      orderBy: { booking_id: 'desc' }
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(200).json([]);
  }
});

/**
 * POST /api/v1/bookings/member
 * Create member VIP booking (VIP FREE - 0 Pesos Invoice)
 */
router.post('/member', requireAuth, async (req, res) => {
  try {
    const { service_id, scheduled_date, time_slot } = req.body;
    if (!service_id || !scheduled_date || !time_slot) {
      return res.status(400).json({ status: 'error', message: 'Missing required booking fields (service_id, scheduled_date, time_slot).' });
    }

    const serviceId = parseInt(service_id, 10);

    // Get the authenticated user
    const dbUser = await prisma.user.findUnique({
      where: { email: req.user.email }
    });
    if (!dbUser) {
      return res.status(404).json({ status: 'error', message: 'User account not found.' });
    }

    // Verify user has an active subscription
    const activeSub = await prisma.subscription.findFirst({
      where: { user_id: dbUser.user_id, plan_status: 'Active' }
    });

    if (!activeSub) {
      return res.status(403).json({
        status: 'error',
        message: 'An active VIP subscription is required to reserve this appointment.'
      });
    }

    const service = await prisma.service.findUnique({ where: { service_id: serviceId } });
    if (!service || !service.is_active) {
      return res.status(404).json({ status: 'error', message: 'Requested service package is inactive or not found.' });
    }

    // Check slot collision
    const existingConflict = await prisma.booking.findFirst({
      where: {
        scheduled_date: new Date(scheduled_date),
        time_slot,
        booking_status: { notIn: ['Cancelled', 'No_Show'] }
      }
    });

    if (existingConflict) {
      return res.status(409).json({ status: 'error', message: `Time slot ${time_slot} on ${scheduled_date} is already occupied.` });
    }

    const result = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          user_id: dbUser.user_id,
          service_id: serviceId,
          scheduled_date: new Date(scheduled_date),
          time_slot,
          bay_number: 1,
          purchased_price: 0.00,
          booking_status: 'Confirmed'
        }
      });

      const newInvoice = await tx.invoice.create({
        data: {
          booking_id: newBooking.booking_id,
          subscription_id: activeSub?.subscription_id || null,
          total_amount: 0.00,
          invoice_type: 'Single_Detailing',
          invoice_status: 'Paid'
        }
      });

      return { booking: newBooking, invoice: newInvoice };
    });

    return res.status(201).json({
      status: 'success',
      message: 'VIP Appointment reserved successfully at ₱0.00 invoice!',
      data: result
    });
  } catch (error) {
    console.error('Error creating member booking:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to reserve VIP booking session.' });
  }
});

/**
 * GET /api/v1/bookings
 * Get bookings list (filtered for current user or all for admin)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, date } = req.query;
    const where = {};

    // Filter by user role unless admin requesting all
    if (req.user.role !== 'Admin') {
      const dbUser = await prisma.user.findUnique({ where: { email: req.user.email } });
      if (!dbUser) {
        // Authenticated but no matching account: return empty list rather than
        // silently creating a managed account as a read side-effect.
        return res.status(200).json({ status: 'success', data: [] });
      }
      where.user_id = dbUser.user_id;
    }

    if (status) {
      where.booking_status = status;
    }
    if (date) {
      where.scheduled_date = new Date(date);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        customer: true,
        user: { select: { user_id: true, username: true, email: true } },
        invoices: { include: { payments: true } },
        feedback: true
      },
      orderBy: { booking_id: 'desc' }
    });

    return res.status(200).json({
      status: 'success',
      data: bookings
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve bookings.'
    });
  }
});

/**
 * GET /api/v1/bookings/availability
 * Check booked time slots for a given date
 */
router.get('/availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ status: 'error', message: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const activeBookings = await prisma.booking.findMany({
      where: {
        scheduled_date: new Date(date),
        booking_status: {
          notIn: ['Cancelled', 'No_Show']
        }
      },
      select: {
        booking_id: true,
        time_slot: true,
        bay_number: true,
        service_id: true
      }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        date,
        booked_slots: activeBookings
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check slot availability.'
    });
  }
});

/**
 * POST /api/v1/bookings
 * Create new booking + auto-generate linked Invoice atomically
 */
router.post('/', validate(createBookingSchema), async (req, res) => {
  try {
    const { service_id, scheduled_date, time_slot, bay_number, full_name, phone_number, email } = req.validated.body;
    const authUser = getOptionalUser(req);

    // 1. Fetch requested service
    const service = await prisma.service.findUnique({
      where: { service_id }
    });

    if (!service || !service.is_active) {
      return res.status(404).json({ status: 'error', message: 'Requested service is inactive or not found.' });
    }

    // 2. Check for slot conflict in same bay
    const existingConflict = await prisma.booking.findFirst({
      where: {
        scheduled_date: new Date(scheduled_date),
        time_slot,
        bay_number,
        booking_status: { notIn: ['Cancelled', 'No_Show'] }
      }
    });

    if (existingConflict) {
      return res.status(409).json({
        status: 'error',
        message: `Bay ${bay_number} is already booked for ${time_slot} on ${scheduled_date}.`
      });
    }

    // 3. Determine Subscriber vs Guest Status (from authenticated token only)
    let targetUserId = null;
    let targetCustomerId = null;
    let isSubscriber = false;
    let subscriptionId = null;

    if (authUser) {
      const activeSub = await prisma.subscription.findFirst({
        where: {
          user_id: authUser.id,
          plan_status: 'Active'
        }
      });
      if (activeSub) {
        isSubscriber = true;
        subscriptionId = activeSub.subscription_id;
        targetUserId = authUser.id;
      }
    }

    if (!targetUserId && email && full_name) {
      // Find or create customer
      let customer = await prisma.customer.findFirst({
        where: { email }
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            full_name,
            phone_number: phone_number || '',
            email,
            customer_type: 'Regular',
            booking_count: 0
          }
        });
      }
      targetCustomerId = customer.customer_id;
    }

    const bookingStatus = isSubscriber ? 'Pending' : 'Pending_Verification';
    const purchasedPrice = service.service_price;

    // 4. Perform atomic transaction: Create Booking & Invoice
    const result = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          customer_id: targetCustomerId,
          user_id: targetUserId,
          service_id,
          scheduled_date: new Date(scheduled_date),
          time_slot,
          bay_number: bay_number || 1,
          purchased_price: purchasedPrice,
          booking_status: bookingStatus
        }
      });

      // Create linked Invoice
      const invoiceAmount = isSubscriber ? 0.00 : purchasedPrice;
      const invoiceStatus = isSubscriber ? 'Paid' : 'Pending';

      const newInvoice = await tx.invoice.create({
        data: {
          booking_id: newBooking.booking_id,
          subscription_id: subscriptionId,
          total_amount: invoiceAmount,
          invoice_type: 'Single_Detailing',
          invoice_status: invoiceStatus
        }
      });

      // If customer row exists, increment booking count
      if (targetCustomerId) {
        await tx.customer.update({
          where: { customer_id: targetCustomerId },
          data: { booking_count: { increment: 1 } }
        });
      }

      return { booking: newBooking, invoice: newInvoice };
    });

    return res.status(201).json({
      status: 'success',
      data: {
        message: 'Booking successfully created!',
        booking_id: result.booking.booking_id,
        invoice_id: result.invoice.invoice_id,
        booking_status: result.booking.booking_status,
        total_amount: result.invoice.total_amount
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process booking creation.'
    });
  }
});

/**
 * PUT /api/v1/bookings/:id/reschedule
 * Reschedule booking time & date
 */
router.put('/:id/reschedule', requireAuth, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { scheduled_date, time_slot, bay_number } = req.body;

    if (!scheduled_date || !time_slot) {
      return res.status(400).json({ status: 'error', message: 'scheduled_date and time_slot are required.' });
    }

    const booking = await prisma.booking.findUnique({ where: { booking_id: bookingId } });
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found.' });
    }

    // Authorization: Admins can reschedule any booking; users can only reschedule their own
    if (req.user.role !== 'Admin') {
      const dbUser = await prisma.user.findUnique({ where: { email: req.user.email } }).catch(() => null);
      const isOwner = booking.user_id === (dbUser?.user_id ?? null) ||
        booking.customer?.email === req.user.email;
      if (!isOwner) {
        return res.status(403).json({ status: 'error', message: 'You do not have permission to reschedule this booking.' });
      }
    }

    // Check slot collision
    const collision = await prisma.booking.findFirst({
      where: {
        booking_id: { not: bookingId },
        scheduled_date: new Date(scheduled_date),
        time_slot,
        bay_number: bay_number || booking.bay_number,
        booking_status: { notIn: ['Cancelled', 'No_Show'] }
      }
    });

    if (collision) {
      return res.status(409).json({ status: 'error', message: 'Selected time slot is already occupied.' });
    }

    const oldDateStr = booking.scheduled_date ? booking.scheduled_date.toISOString().split('T')[0] : 'N/A';
    const oldTimeStr = booking.time_slot || 'N/A';

    const updatedBooking = await prisma.booking.update({
      where: { booking_id: bookingId },
      data: {
        scheduled_date: new Date(scheduled_date),
        time_slot,
        ...(bay_number && { bay_number })
      },
      include: {
        service: true,
        customer: true,
        user: true,
        invoices: true
      }
    });

    const recipientEmail = updatedBooking.customer?.email || updatedBooking.user?.email;
    const recipientName = updatedBooking.customer?.full_name || updatedBooking.user?.username;
    const invoiceId = updatedBooking.invoices[0]?.invoice_id || bookingId;

    if (recipientEmail) {
      const { sendRescheduleEmail } = require('../services/mailer');
      sendRescheduleEmail({
        to: recipientEmail,
        clientName: recipientName,
        bookingId: updatedBooking.booking_id,
        invoiceId,
        serviceName: updatedBooking.service?.service_name,
        oldDate: oldDateStr,
        oldTime: oldTimeStr,
        newDate: scheduled_date,
        newTime: time_slot
      }).catch(e => console.error('Reschedule Email Error:', e));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Booking rescheduled successfully.',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to reschedule booking.' });
  }
});

/**
 * PUT /api/v1/bookings/:id/cancel
 * Cancel booking
 */
router.put('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);

    const booking = await prisma.booking.findUnique({
      where: { booking_id: bookingId },
      include: { service: true, customer: true, user: true, invoices: true }
    });
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found.' });
    }

    // Authorization: Admins can cancel any booking; users can only cancel their own
    if (req.user.role !== 'Admin') {
      const dbUser = await prisma.user.findUnique({ where: { email: req.user.email } }).catch(() => null);
      const isOwner = booking.user_id === (dbUser?.user_id ?? null) ||
        booking.customer?.email === req.user.email;
      if (!isOwner) {
        return res.status(403).json({ status: 'error', message: 'You do not have permission to cancel this booking.' });
      }
    }

    const cancelledBooking = await prisma.booking.update({
      where: { booking_id: bookingId },
      data: { booking_status: 'Cancelled' }
    });

    // Mark invoice void if pending
    await prisma.invoice.updateMany({
      where: { booking_id: bookingId, invoice_status: 'Pending' },
      data: { invoice_status: 'Void' }
    });

    const recipientEmail = booking.customer?.email || booking.user?.email;
    const recipientName = booking.customer?.full_name || booking.user?.username;
    const invoiceId = booking.invoices[0]?.invoice_id || bookingId;

    if (recipientEmail) {
      const { sendUserCancelBookingEmail } = require('../services/mailer');
      sendUserCancelBookingEmail({
        to: recipientEmail,
        clientName: recipientName,
        bookingId: booking.booking_id,
        invoiceId,
        serviceName: booking.service?.service_name
      }).catch(e => console.error('Cancel Booking Email Error:', e));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully.',
      data: cancelledBooking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to cancel booking.' });
  }
});

/**
 * PUT /api/v1/bookings/:id/status
 * Admin update booking status
 */
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { booking_status } = req.body;

    if (!booking_status) {
      return res.status(400).json({ status: 'error', message: 'booking_status is required.' });
    }

    const updated = await prisma.booking.update({
      where: { booking_id: bookingId },
      data: { booking_status }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Booking status updated.',
      data: updated
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update booking status.' });
  }
});

module.exports = router;
