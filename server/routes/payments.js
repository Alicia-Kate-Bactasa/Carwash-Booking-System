const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

// Validation schema for submitting payment
const submitPaymentSchema = z.object({
  body: z.object({
    invoice_id: z.number().int().positive('Valid invoice_id is required'),
    amount: z.number().positive('Amount must be greater than 0'),
    payment_method: z.string().default('GCash'),
    proof_of_payment: z.string().min(5, 'Proof of payment image URL/reference is required')
  })
});

/**
 * GET /api/v1/payments/invoices
 * Retrieve invoices and payments
 */
router.get('/invoices', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status) {
      where.invoice_status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        booking: { include: { service: true } },
        subscription: { include: { user: true } },
        payments: true
      },
      orderBy: { invoice_id: 'desc' }
    });

    return res.status(200).json({
      status: 'success',
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve invoices.' });
  }
});

/**
 * POST /api/v1/payments
 * Submit GCash payment proof
 */
router.post('/', validate(submitPaymentSchema), async (req, res) => {
  try {
    const { invoice_id, amount, payment_method, proof_of_payment } = req.validated.body;

    const invoice = await prisma.invoice.findUnique({
      where: { invoice_id }
    });

    if (!invoice) {
      return res.status(404).json({ status: 'error', message: 'Invoice not found.' });
    }

    const newPayment = await prisma.payment.create({
      data: {
        invoice_id,
        amount,
        payment_method: payment_method || 'GCash',
        proof_of_payment,
        payment_status: 'Pending_Approval'
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Payment proof submitted successfully. Pending Admin verification.',
      data: newPayment
    });
  } catch (error) {
    console.error('Error submitting payment:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to submit payment.' });
  }
});

/**
 * PUT /api/v1/payments/:id/approve
 * Admin approve payment proof -> Marks Invoice as Paid, Booking as Confirmed, Subscription as Active
 */
router.put('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id, 10);

    const payment = await prisma.payment.findUnique({
      where: { payment_id: paymentId },
      include: { invoice: true }
    });

    if (!payment) {
      return res.status(404).json({ status: 'error', message: 'Payment record not found.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Approve Payment
      const approvedPayment = await tx.payment.update({
        where: { payment_id: paymentId },
        data: { payment_status: 'Paid' }
      });

      // 2. Mark Invoice Paid
      const updatedInvoice = await tx.invoice.update({
        where: { invoice_id: payment.invoice_id },
        data: { invoice_status: 'Paid' }
      });

      // 3. If tied to a Booking, set Booking to Confirmed
      if (payment.invoice.booking_id) {
        await tx.booking.update({
          where: { booking_id: payment.invoice.booking_id },
          data: { booking_status: 'Confirmed' }
        });
      }

      // 4. If tied to a Subscription, set Subscription to Active
      if (payment.invoice.subscription_id) {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        await tx.subscription.update({
          where: { subscription_id: payment.invoice.subscription_id },
          data: {
            plan_status: 'Active',
            last_billing_date: today,
            next_billing_date: nextMonth
          }
        });
      }

      return { payment: approvedPayment, invoice: updatedInvoice };
    });

    return res.status(200).json({
      status: 'success',
      message: 'Payment approved. Invoice and related records activated.',
      data: result
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to approve payment.' });
  }
});

/**
 * PUT /api/v1/payments/:id/reject
 * Admin reject payment proof
 */
router.put('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id, 10);

    const rejectedPayment = await prisma.payment.update({
      where: { payment_id: paymentId },
      data: { payment_status: 'Rejected' }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Payment status marked as Rejected.',
      data: rejectedPayment
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to reject payment.' });
  }
});

module.exports = router;
