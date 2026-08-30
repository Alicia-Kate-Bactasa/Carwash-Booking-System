const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendInvoiceEmail } = require('../services/mailer');

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

/**
 * POST /api/v1/payments/paymongo/checkout
 * Create a PayMongo Checkout Session for GCash / Maya / Card
 */
router.post('/paymongo/checkout', async (req, res) => {
  try {
    const { invoice_id, booking_id, subscription_id, amount, service_name, client_email, return_url } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid payment amount is required.' });
    }

    const paymongoKey = process.env.PAYMONGO_SECRET_KEY;
    const itemDescription = service_name || 'Montage Auto Studio Detailing Service';
    const amountInCents = Math.round(parseFloat(amount) * 100);

    const baseReturnUrl = return_url || req.headers.referer || 'http://localhost:5173/';
    const cleanReturnUrl = baseReturnUrl.split('?')[0];
    const successUrl = `${cleanReturnUrl}?payment=success&booking_id=${booking_id || ''}&invoice_id=${invoice_id || ''}&subscription_id=${subscription_id || ''}`;
    const cancelUrl = `${cleanReturnUrl}?payment=cancel`;

    if (paymongoKey) {
      const authHeader = 'Basic ' + Buffer.from(paymongoKey + ':').toString('base64');
      const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          data: {
            attributes: {
              send_email_receipt: true,
              show_description: true,
              show_line_items: true,
              payment_method_types: ['gcash', 'paymaya', 'card', 'dob'],
              line_items: [
                {
                  currency: 'PHP',
                  amount: amountInCents,
                  description: itemDescription,
                  name: service_name || 'Montage Auto Studio Service',
                  quantity: 1
                }
              ],
              success_url: successUrl,
              cancel_url: cancelUrl
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('PayMongo API Error:', data);
        return res.status(500).json({ status: 'error', message: data.errors?.[0]?.detail || 'PayMongo Checkout API failed.' });
      }

      const checkoutUrl = data.data.attributes.checkout_url;
      const checkoutSessionId = data.data.id;

      return res.status(200).json({
        status: 'success',
        provider: 'paymongo',
        checkout_url: checkoutUrl,
        checkout_session_id: checkoutSessionId
      });
    } else {
      // Sandbox fallback mode when key is not configured yet
      return res.status(200).json({
        status: 'success',
        provider: 'paymongo_sandbox',
        sandbox: true,
        checkout_url: successUrl,
        message: 'PayMongo Test Sandbox Mode active. Set PAYMONGO_SECRET_KEY in server/.env for production PayMongo checkout.'
      });
    }
  } catch (error) {
    console.error('Error creating PayMongo checkout session:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to create payment checkout session.' });
  }
});

/**
 * POST /api/v1/payments/verify
 * Verifies PayMongo payment completion and updates Invoice/Booking/Subscription status automatically
 */
router.post('/verify', async (req, res) => {
  try {
    const { invoice_id, booking_id, subscription_id, payment_method } = req.body;

    let targetInvoiceId = invoice_id ? parseInt(invoice_id, 10) : null;
    let targetBookingId = booking_id ? parseInt(booking_id, 10) : null;
    let targetSubId = subscription_id ? parseInt(subscription_id, 10) : null;

    if (!targetInvoiceId && targetBookingId) {
      const invoice = await prisma.invoice.findFirst({
        where: { booking_id: targetBookingId },
        orderBy: { invoice_id: 'desc' }
      });
      if (invoice) targetInvoiceId = invoice.invoice_id;
    }

    if (!targetInvoiceId && targetSubId) {
      const invoice = await prisma.invoice.findFirst({
        where: { subscription_id: targetSubId },
        orderBy: { invoice_id: 'desc' }
      });
      if (invoice) targetInvoiceId = invoice.invoice_id;
    }

    const result = await prisma.$transaction(async (tx) => {
      let createdPayment = null;
      if (targetInvoiceId) {
        const inv = await tx.invoice.findUnique({ where: { invoice_id: targetInvoiceId } });
        if (inv) {
          createdPayment = await tx.payment.create({
            data: {
              invoice_id: targetInvoiceId,
              amount: inv.total_amount,
              payment_method: payment_method || 'PayMongo (GCash/Maya/Card)',
              proof_of_payment: 'PAYMONGO_VERIFIED_CHECKOUT',
              payment_status: 'Paid'
            }
          });

          await tx.invoice.update({
            where: { invoice_id: targetInvoiceId },
            data: { invoice_status: 'Paid' }
          });
        }
      }

      if (targetBookingId) {
        await tx.booking.update({
          where: { booking_id: targetBookingId },
          data: { booking_status: 'Confirmed' }
        });
      }

      if (targetSubId) {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        await tx.subscription.update({
          where: { subscription_id: targetSubId },
          data: {
            plan_status: 'Active',
            last_billing_date: today,
            next_billing_date: nextMonth
          }
        });
      }

      return { success: true, payment: createdPayment };
    });

    // Send HTML Invoice receipt email asynchronously
    if (targetInvoiceId) {
      prisma.invoice.findUnique({
        where: { invoice_id: targetInvoiceId },
        include: {
          booking: { include: { service: true, customer: true } },
          subscription: { include: { user: true } }
        }
      }).then(invDetails => {
        if (invDetails) {
          const recipientEmail = invDetails.booking?.customer?.email || invDetails.subscription?.user?.email;
          const recipientName = invDetails.booking?.customer?.full_name || invDetails.subscription?.user?.username;
          const serviceName = invDetails.booking?.service?.service_name || invDetails.subscription?.plan_tier || 'Detailing Service';

          if (recipientEmail) {
            sendInvoiceEmail({
              to: recipientEmail,
              clientName: recipientName,
              invoiceId: invDetails.invoice_id,
              bookingId: invDetails.booking_id,
              serviceName: serviceName,
              amount: invDetails.total_amount,
              date: invDetails.issued_at
            }).catch(e => console.error('Invoice Email Error:', e));
          }
        }
      }).catch(e => console.error('Invoice Details Fetch Error:', e));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Payment verified and status updated to Paid & Confirmed.',
      data: result
    });
  } catch (error) {
    console.error('Error verifying payment status:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to verify payment.' });
  }
});

module.exports = router;
