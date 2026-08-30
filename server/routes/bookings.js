const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

// Zod schema for booking creation
const createBookingSchema = z.object({
  body: z.object({
    service_id: z.number().int().positive('Valid service_id is required'),
    scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'scheduled_date must be YYYY-MM-DD'),
    time_slot: z.string().min(1, 'time_slot is required'),
    bay_number: z.number().int().positive().default(1),
    // Optional guest details if not signed in as a registered subscriber
    full_name: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().email().optional(),
    user_id: z.number().int().optional()
  })
});

/**
 * GET /api/v1/user/bookings
 * Get current user bookings list
 */
router.get('/user/bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
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
 * Create member booking
 */
router.post('/member', async (req, res) => {
  try {
    const { service_id, scheduled_date, time_slot } = req.body;
    if (!service_id || !scheduled_date || !time_slot) {
      return res.status(400).json({ status: 'error', message: 'Missing required booking fields.' });
    }

    const newBooking = await prisma.booking.create({
      data: {
        service_id: parseInt(service_id, 10),
        scheduled_date: new Date(scheduled_date),
        time_slot,
        purchased_price: 0,
        booking_status: 'Confirmed'
      }
    });

    return res.status(201).json({ status: 'success', data: newBooking });
  } catch (error) {
    console.error('Error creating member booking:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to reserve booking session.' });
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
    const { service_id, scheduled_date, time_slot, bay_number, full_name, phone_number, email, user_id } = req.validated.body;

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

    // 3. Determine Subscriber vs Guest Status
    let targetUserId = user_id || null;
    let targetCustomerId = null;
    let isSubscriber = false;
    let subscriptionId = null;

    if (targetUserId) {
      const activeSub = await prisma.subscription.findFirst({
        where: {
          user_id: targetUserId,
          plan_status: 'Active'
        }
      });
      if (activeSub) {
        isSubscriber = true;
        subscriptionId = activeSub.subscription_id;
      }
    } else if (email && full_name) {
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

    const updatedBooking = await prisma.booking.update({
      where: { booking_id: bookingId },
      data: {
        scheduled_date: new Date(scheduled_date),
        time_slot,
        ...(bay_number && { bay_number })
      }
    });

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

    const booking = await prisma.booking.findUnique({ where: { booking_id: bookingId } });
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found.' });
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
