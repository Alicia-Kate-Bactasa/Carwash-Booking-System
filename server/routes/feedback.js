const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

const feedbackSchema = z.object({
  body: z.object({
    booking_id: z.number().int().positive('booking_id is required'),
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    comments: z.string().optional()
  })
});

/**
 * GET /api/v1/feedback
 * Fetch feedback entries
 */
router.get('/', async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        booking: {
          include: {
            service: true,
            customer: true,
            user: { select: { username: true } }
          }
        }
      },
      orderBy: { feedback_id: 'desc' }
    });

    return res.status(200).json({ status: 'success', data: feedbacks });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve feedback.' });
  }
});

/**
 * GET /api/v1/feedback/verify-booking/:bookingId
 * Automatically verifies if a booking exists, is completed, and gets customer & service details
 */
router.get('/verify-booking/:bookingId', async (req, res) => {
  try {
    const rawId = req.params.bookingId.replace(/[^0-9]/g, '');
    const bookingId = parseInt(rawId, 10);

    if (!bookingId) {
      return res.status(400).json({ status: 'error', message: 'Valid numeric booking ID is required.' });
    }

    const booking = await prisma.booking.findUnique({
      where: { booking_id: bookingId },
      include: {
        service: true,
        customer: true,
        user: true,
        feedback: true
      }
    });

    if (!booking) {
      return res.status(404).json({ status: 'error', message: `Booking #MTG-${bookingId} was not found.` });
    }

    if (booking.booking_status !== 'Completed') {
      return res.status(400).json({
        status: 'error',
        message: `Booking #MTG-${bookingId} is currently '${booking.booking_status}'. Feedback can only be submitted once the service is Completed.`
      });
    }

    if (booking.feedback) {
      return res.status(409).json({
        status: 'error',
        message: `Feedback has already been submitted for Booking #MTG-${bookingId}.`
      });
    }

    const customerName = booking.customer?.full_name || booking.user?.username || 'Valued Customer';
    const serviceName = booking.service?.service_name || 'Detailing Service';

    return res.status(200).json({
      status: 'success',
      data: {
        booking_id: booking.booking_id,
        customer_name: customerName,
        service_name: serviceName,
        service_price: booking.purchased_price || booking.service?.service_price,
        scheduled_date: booking.scheduled_date,
        time_slot: booking.time_slot
      }
    });
  } catch (error) {
    console.error('Error verifying booking for feedback:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to verify booking details.' });
  }
});

/**
 * POST /api/v1/feedback
 * Submit feedback for a completed booking
 */
router.post('/', validate(feedbackSchema), async (req, res) => {
  try {
    const { booking_id, rating, comments } = req.validated.body;

    const booking = await prisma.booking.findUnique({
      where: { booking_id }
    });

    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found.' });
    }

    const existingFeedback = await prisma.feedback.findUnique({
      where: { booking_id }
    });

    if (existingFeedback) {
      return res.status(409).json({ status: 'error', message: 'Feedback has already been submitted for this booking.' });
    }

    const newFeedback = await prisma.feedback.create({
      data: {
        booking_id,
        rating,
        comments: comments || ''
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Thank you! Your feedback has been recorded.',
      data: newFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to submit feedback.' });
  }
});

module.exports = router;
