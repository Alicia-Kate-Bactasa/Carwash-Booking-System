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
