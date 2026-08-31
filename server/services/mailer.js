const nodemailer = require('nodemailer');

/**
 * Configure SMTP Transporter (Gmail / Custom SMTP)
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
};

/**
 * Common SendMail helper with fallback logging
 */
const sendMailHelper = async ({ to, subject, htmlContent, tag }) => {
  const from = process.env.SMTP_FROM || `"Montage Auto Studio" <${process.env.SMTP_USER || 'bactasa.kate.2006@gmail.com'}>`;
  const transporter = getTransporter();

  if (transporter && to) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent
      });
      console.log(`✉️ Mailer [${tag}]: Sent successfully to ${to}`);
      return { success: true, delivered: true };
    } catch (error) {
      console.error(`❌ Mailer [${tag}] SMTP Error:`, error.message);
    }
  }

  console.log(`\n=================== MAIL SIMULATION [${tag}] ===================`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`=================================================================\n`);
  return { success: true, delivered: false, simulated: true };
};

/**
 * High-End Master Responsive HTML Wrapper
 */
const renderWrapper = ({ title, statusBadge, statusColor, contentHtml }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#FAFAFA; font-family:'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; color:#111111;">
  <div style="max-width:600px; margin:20px auto; background-color:#ffffff; border:1px solid #E5E5E5; border-radius:24px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.04);">
    <!-- Brand Header -->
    <div style="background-color:#111111; padding:32px 30px; text-align:center; color:#ffffff;">
      <span style="font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#A3A3A3; display:block; margin-bottom:6px;">Montage Auto Studio</span>
      <h1 style="margin:0; font-size:22px; font-weight:900; letter-spacing:1px; text-transform:uppercase; color:#ffffff;">${title}</h1>
      ${statusBadge ? `
        <div style="margin-top:14px;">
          <span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; background-color:${statusColor || '#22C55E'}; color:#ffffff; padding:6px 16px; border-radius:20px;">${statusBadge}</span>
        </div>
      ` : ''}
    </div>

    <!-- Content Area -->
    <div style="padding:32px 30px;">
      ${contentHtml}
    </div>

    <!-- Brand Footer -->
    <div style="background-color:#F5F5F5; padding:24px 30px; border-top:1px solid #E5E5E5; text-align:center; font-size:11px; color:#737373; line-height:1.6;">
      <strong style="color:#111111; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Montage Auto Studio</strong><br>
      Banilad, Mandaue City, Cebu, Philippines • Mon–Sat: 9:00 AM – 5:00 PM<br>
      © 2026 Montage Auto Studio. All Rights Reserved.
    </div>
  </div>
</body>
</html>
`;

// Helper for Ref Cards
const renderRefCard = ({ bookingId, invoiceId, clientName }) => `
<div style="background-color:#F8F9FA; border:1px solid #E5E5E5; border-radius:16px; padding:20px; margin:24px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px; color:#111111;">
    <tr>
      <td style="padding:4px 0; color:#737373; font-weight:600; width:40%;">Customer Name:</td>
      <td style="padding:4px 0; font-weight:800; text-align:right;">${clientName || 'Valued Customer'}</td>
    </tr>
    ${bookingId ? `
    <tr>
      <td style="padding:4px 0; color:#737373; font-weight:600;">Booking Reference ID:</td>
      <td style="padding:4px 0; font-weight:800; font-family:monospace; text-align:right; color:#111111;">MTG-${bookingId}</td>
    </tr>
    ` : ''}
    ${invoiceId ? `
    <tr>
      <td style="padding:4px 0; color:#737373; font-weight:600;">Invoice Reference ID:</td>
      <td style="padding:4px 0; font-weight:800; font-family:monospace; text-align:right; color:#111111;">INV-${invoiceId}</td>
    </tr>
    ` : ''}
  </table>
</div>
`;

// ----------------------------------------------------------------------------
// 1. Payment Success Official HTML Invoice
// ----------------------------------------------------------------------------
const sendPaymentSuccessInvoiceEmail = async ({ to, clientName, invoiceId, bookingId, serviceName, amount, date }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Dear <strong>${clientName || 'Valued Customer'}</strong>,<br>
      Thank you for your payment! Your transaction has been verified successfully.
    </p>

    ${renderRefCard({ bookingId, invoiceId, clientName })}

    <table style="width:100%; border-collapse:collapse; margin:24px 0; font-size:13px;">
      <thead>
        <tr style="border-bottom:2px solid #111111; text-align:left;">
          <th style="padding:8px 0; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#111111;">Item Description</th>
          <th style="padding:8px 0; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:#111111; text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #EEEEEE;">
          <td style="padding:14px 0; font-weight:600; color:#333333;">${serviceName || 'Detailing Package Treatment'}</td>
          <td style="padding:14px 0; font-weight:800; text-align:right; color:#111111;">₱${parseFloat(amount || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div style="background-color:#F5F5F5; padding:16px 20px; border-radius:12px; text-align:right; font-size:16px; font-weight:900; color:#111111;">
      Total Paid: ₱${parseFloat(amount || 0).toFixed(2)}
    </div>
  `;

  return sendMailHelper({
    to,
    subject: `Official Payment Invoice INV-${invoiceId} — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Payment Invoice Receipt',
      statusBadge: 'PAID & VERIFIED',
      statusColor: '#22C55E',
      contentHtml
    }),
    tag: 'Payment Success Invoice'
  });
};

// ----------------------------------------------------------------------------
// 2. User Completes a Booking
// ----------------------------------------------------------------------------
const sendBookingCompletedEmail = async ({ to, clientName, invoiceId, bookingId, serviceName, date, timeSlot }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Dear <strong>${clientName || 'Valued Customer'}</strong>,<br>
      Your appointment session is now officially confirmed and scheduled in our Banilad twin-bay facility!
    </p>

    ${renderRefCard({ bookingId, invoiceId, clientName })}

    <div style="background-color:#F8F9FA; border-left:4px solid #111111; padding:16px 20px; border-radius:8px; margin:24px 0; font-size:13px; line-height:1.6;">
      <strong>Scheduled Date:</strong> ${date ? String(date).split('T')[0] : '—'}<br>
      <strong>Time Slot Window:</strong> ${timeSlot || '—'}<br>
      <strong>Selected Treatment:</strong> ${serviceName || 'Standard Car Wash'}
    </div>
  `;

  return sendMailHelper({
    to,
    subject: `Booking Confirmed MTG-${bookingId} — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Appointment Confirmed',
      statusBadge: 'CONFIRMED SLOT',
      statusColor: '#22C55E',
      contentHtml
    }),
    tag: 'Booking Confirmed'
  });
};

// ----------------------------------------------------------------------------
// 3. Payment Failed / Cancelled
// ----------------------------------------------------------------------------
const sendPaymentFailedEmail = async ({ to, clientName, bookingId, invoiceId, serviceName, reason }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Dear <strong>${clientName || 'Valued Customer'}</strong>,<br>
      We were unable to process your payment for <strong>${serviceName || 'Detailing Session'}</strong>.
    </p>

    ${renderRefCard({ bookingId, invoiceId, clientName })}

    <p style="font-size:13px; color:#EF4444; font-weight:600; background-color:#FEF2F2; padding:14px; border-radius:10px; border:1px solid #FCA5A5;">
      Reason: ${reason || 'Payment checkout session was cancelled or failed verification.'}
    </p>
  `;

  return sendMailHelper({
    to,
    subject: `Payment Unsuccessful MTG-${bookingId || 'ERR'} — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Payment Failed',
      statusBadge: 'PAYMENT UNPAID',
      statusColor: '#EF4444',
      contentHtml
    }),
    tag: 'Payment Failed'
  });
};

// ----------------------------------------------------------------------------
// 4. User Registers Account (₱1,500 VIP Membership Activated)
// ----------------------------------------------------------------------------
const sendRegistrationSuccessEmail = async ({ to, clientName, invoiceId, email, planTier = 'Unlimited VIP Wash Club', amount = '1,500' }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Welcome to the Club, <strong>${clientName || 'VIP Member'}</strong>!<br>
      Your payment of ₱${amount} has been verified and your VIP Membership Account is now fully active.
    </p>

    ${renderRefCard({ bookingId: null, invoiceId, clientName })}

    <div style="background-color:#F8F9FA; border:1px solid #E5E5E5; padding:18px; border-radius:12px; margin:20px 0; font-size:13px; line-height:1.6;">
      <strong>Account Email:</strong> ${email}<br>
      <strong>Subscription Plan:</strong> ${planTier}<br>
      <strong>Monthly Amount Invoiced:</strong> ₱${amount}.00
    </div>
  `;

  return sendMailHelper({
    to,
    subject: `VIP Membership Activated INV-${invoiceId} — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'VIP Account Opened',
      statusBadge: 'MEMBERSHIP ACTIVE',
      statusColor: '#22C55E',
      contentHtml
    }),
    tag: 'Registration Success'
  });
};

// ----------------------------------------------------------------------------
// 5. User Registration Failed (Payment Failed / Account Not Opened)
// ----------------------------------------------------------------------------
const sendRegistrationFailedEmail = async ({ to, clientName, reason }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Hello <strong>${clientName || 'Valued Customer'}</strong>,<br>
      Your VIP membership account registration could not be completed because payment was cancelled or declined. No charges were created and no account data was saved.
    </p>

    <p style="font-size:13px; color:#EF4444; font-weight:600; background-color:#FEF2F2; padding:14px; border-radius:10px; border:1px solid #FCA5A5;">
      Notice: ${reason || 'Checkout transaction was cancelled.'}
    </p>
  `;

  return sendMailHelper({
    to,
    subject: `Registration Unsuccessful — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Registration Cancelled',
      statusBadge: 'ACCOUNT NOT OPENED',
      statusColor: '#EF4444',
      contentHtml
    }),
    tag: 'Registration Failed'
  });
};

// ----------------------------------------------------------------------------
// 6. Resetting Password OTP Code
// ----------------------------------------------------------------------------
const sendPasswordResetOtpEmail = async ({ to, otp }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      We received a password reset request for your Montage Auto Studio member account. Please use the 6-digit verification code below:
    </p>

    <div style="background-color:#F8F9FA; border:2px solid #111111; border-radius:16px; padding:24px; margin:24px 0; text-align:center;">
      <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:#737373; display:block; margin-bottom:8px;">6-Digit OTP Code</span>
      <span style="font-size:36px; font-weight:900; letter-spacing:10px; color:#111111; font-family:monospace;">${otp}</span>
    </div>

    <p style="font-size:12px; color:#737373; text-align:center;">This code will expire in 1 hour.</p>
  `;

  return sendMailHelper({
    to,
    subject: `Password Reset OTP Code — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Password Reset',
      statusBadge: 'VERIFICATION CODE',
      statusColor: '#111111',
      contentHtml
    }),
    tag: 'Password Reset OTP'
  });
};

// ----------------------------------------------------------------------------
// 7. User Reschedules Booking
// ----------------------------------------------------------------------------
const sendRescheduleEmail = async ({ to, clientName, bookingId, invoiceId, serviceName, oldDate, oldTime, newDate, newTime }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Dear <strong>${clientName || 'Valued Customer'}</strong>,<br>
      Your appointment session <strong>MTG-${bookingId}</strong> has been rescheduled.
    </p>

    ${renderRefCard({ bookingId, invoiceId, clientName })}

    <div style="background-color:#FFFBEB; border:1px solid #FCD34D; padding:16px; border-radius:12px; margin:20px 0; font-size:13px; line-height:1.6;">
      <div style="color:#B45309; margin-bottom:8px;"><strong>Previous Schedule:</strong> ${oldDate} @ ${oldTime}</div>
      <div style="color:#111111; font-weight:700;"><strong>New Updated Schedule:</strong> ${newDate} @ ${newTime}</div>
    </div>
  `;

  return sendMailHelper({
    to,
    subject: `Reschedule Confirmation MTG-${bookingId} — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Booking Rescheduled',
      statusBadge: 'RESCHEDULED',
      statusColor: '#F59E0B',
      contentHtml
    }),
    tag: 'Reschedule Notice'
  });
};

// ----------------------------------------------------------------------------
// 8. User Cancels Booking
// ----------------------------------------------------------------------------
const sendUserCancelBookingEmail = async ({ to, clientName, bookingId, invoiceId, serviceName }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Dear <strong>${clientName || 'Valued Customer'}</strong>,<br>
      As requested, your appointment booking <strong>MTG-${bookingId}</strong> for <strong>${serviceName || 'Detailing Treatment'}</strong> has been cancelled.
    </p>

    ${renderRefCard({ bookingId, invoiceId, clientName })}
  `;

  return sendMailHelper({
    to,
    subject: `Booking Cancellation MTG-${bookingId} — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Booking Cancelled',
      statusBadge: 'CANCELLED BY USER',
      statusColor: '#EF4444',
      contentHtml
    }),
    tag: 'User Cancel Booking'
  });
};

// ----------------------------------------------------------------------------
// 9. Admin Cancels Booking
// ----------------------------------------------------------------------------
const sendAdminCancelBookingEmail = async ({ to, clientName, bookingId, invoiceId, serviceName, reason }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Dear <strong>${clientName || 'Valued Customer'}</strong>,<br>
      Your appointment booking <strong>MTG-${bookingId}</strong> was updated to Cancelled by our studio management.
    </p>

    ${renderRefCard({ bookingId, invoiceId, clientName })}

    ${reason ? `
      <p style="font-size:13px; color:#EF4444; background-color:#FEF2F2; padding:12px; border-radius:8px;">
        Reason: ${reason}
      </p>
    ` : ''}
  `;

  return sendMailHelper({
    to,
    subject: `Studio Notice: Booking Cancelled MTG-${bookingId}`,
    htmlContent: renderWrapper({
      title: 'Booking Cancelled',
      statusBadge: 'CANCELLED BY STUDIO',
      statusColor: '#EF4444',
      contentHtml
    }),
    tag: 'Admin Cancel Booking'
  });
};

// ----------------------------------------------------------------------------
// 10. Admin Completes Booking
// ----------------------------------------------------------------------------
const sendAdminCompleteBookingEmail = async ({ to, clientName, bookingId, invoiceId, serviceName }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Dear <strong>${clientName || 'Valued Customer'}</strong>,<br>
      Your detailing treatment <strong>${serviceName || 'Car Wash Package'}</strong> for booking <strong>MTG-${bookingId}</strong> has been marked as Completed!
    </p>

    ${renderRefCard({ bookingId, invoiceId, clientName })}

    <p style="font-size:13px; line-height:1.6; color:#555555;">
      We hope you enjoy your freshly detailed vehicle. We would love to hear your feedback on your experience!
    </p>
  `;

  return sendMailHelper({
    to,
    subject: `Service Completed MTG-${bookingId} — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Service Completed',
      statusBadge: 'COMPLETED',
      statusColor: '#22C55E',
      contentHtml
    }),
    tag: 'Admin Complete Booking'
  });
};

// ----------------------------------------------------------------------------
// 11. Admin Completes Walk-In Form
// ----------------------------------------------------------------------------
const sendWalkInBookingEmail = async ({ to, clientName, bookingId, invoiceId, serviceName, scheduledDate, timeSlot, price }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Hello <strong>${clientName || 'Walk-In Customer'}</strong>,<br>
      Your studio walk-in appointment has been logged at our Banilad counter.
    </p>

    ${renderRefCard({ bookingId, invoiceId, clientName })}

    <div style="background-color:#F8F9FA; border:1px solid #E5E5E5; padding:18px; border-radius:12px; margin:20px 0; font-size:13px; line-height:1.6;">
      <strong>Scheduled Date:</strong> ${scheduledDate || 'Today'}<br>
      <strong>Time Slot:</strong> ${timeSlot || 'Immediate Counter'}<br>
      <strong>Treatment:</strong> ${serviceName || 'Walk-In Detailing'}<br>
      <strong>Total Invoiced:</strong> ₱${parseFloat(price || 0).toFixed(2)}
    </div>
  `;

  return sendMailHelper({
    to,
    subject: `Walk-In Studio Receipt MTG-${bookingId} — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Walk-In Appointment',
      statusBadge: 'WALK-IN LOGGED',
      statusColor: '#111111',
      contentHtml
    }),
    tag: 'Walk-In Booking'
  });
};

// ----------------------------------------------------------------------------
// 12. User Makes Monthly Subscription Payment (₱1,500)
// ----------------------------------------------------------------------------
const sendMonthlySubscriptionPaymentEmail = async ({ to, clientName, subscriptionId, invoiceId, amount = '1,500', nextBillingDate }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Dear <strong>${clientName || 'VIP Member'}</strong>,<br>
      Your monthly renewal payment of ₱${amount}.00 for Unlimited VIP Wash Club membership was processed successfully.
    </p>

    ${renderRefCard({ bookingId: null, invoiceId, clientName })}

    <div style="background-color:#F8F9FA; border:1px solid #E5E5E5; padding:18px; border-radius:12px; margin:20px 0; font-size:13px; line-height:1.6;">
      <strong>Subscription ID:</strong> SUB-${subscriptionId || 'VIP'}<br>
      <strong>Monthly Rate Paid:</strong> ₱${amount}.00<br>
      <strong>Next Renewal Date:</strong> ${nextBillingDate || '1 Month From Today'}
    </div>
  `;

  return sendMailHelper({
    to,
    subject: `Monthly VIP Subscription Renewal Receipt INV-${invoiceId}`,
    htmlContent: renderWrapper({
      title: 'Subscription Renewal',
      statusBadge: 'PAYMENT VERIFIED',
      statusColor: '#22C55E',
      contentHtml
    }),
    tag: 'Monthly Subscription Payment'
  });
};

// ----------------------------------------------------------------------------
// 13. User Cancels Subscription
// ----------------------------------------------------------------------------
const sendSubscriptionCancelledEmail = async ({ to, clientName, subscriptionId }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Dear <strong>${clientName || 'VIP Member'}</strong>,<br>
      Your Unlimited VIP Wash Club subscription (ID: SUB-${subscriptionId || 'VIP'}) has been cancelled as requested.
    </p>

    <p style="font-size:13px; color:#555555; line-height:1.6;">
      We appreciate your support! You may reactivate your VIP membership at any time from your Member Workspace.
    </p>
  `;

  return sendMailHelper({
    to,
    subject: `VIP Subscription Cancelled — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Subscription Cancelled',
      statusBadge: 'CANCELLED',
      statusColor: '#EF4444',
      contentHtml
    }),
    tag: 'Subscription Cancelled'
  });
};

// ----------------------------------------------------------------------------
// 14. User Reactivates Subscription
// ----------------------------------------------------------------------------
const sendSubscriptionReactivatedEmail = async ({ to, clientName, subscriptionId, nextBillingDate }) => {
  const contentHtml = `
    <p style="font-size:14px; margin:0 0 16px 0; line-height:1.6; color:#333333;">
      Welcome back, <strong>${clientName || 'VIP Member'}</strong>!<br>
      Your Unlimited VIP Wash Club subscription (ID: SUB-${subscriptionId || 'VIP'}) is now reactivated and active.
    </p>

    <div style="background-color:#F8F9FA; border:1px solid #E5E5E5; padding:18px; border-radius:12px; margin:20px 0; font-size:13px; line-height:1.6;">
      <strong>Status:</strong> Active VIP Membership<br>
      <strong>Next Billing Cycle:</strong> ${nextBillingDate || 'Next Month'}
    </div>
  `;

  return sendMailHelper({
    to,
    subject: `VIP Subscription Reactivated — Montage Auto Studio`,
    htmlContent: renderWrapper({
      title: 'Subscription Active',
      statusBadge: 'REACTIVATED',
      statusColor: '#22C55E',
      contentHtml
    }),
    tag: 'Subscription Reactivated'
  });
};

module.exports = {
  sendPaymentSuccessInvoiceEmail,
  sendBookingCompletedEmail,
  sendPaymentFailedEmail,
  sendRegistrationSuccessEmail,
  sendRegistrationFailedEmail,
  sendPasswordResetOtpEmail,
  sendRescheduleEmail,
  sendUserCancelBookingEmail,
  sendAdminCancelBookingEmail,
  sendAdminCompleteBookingEmail,
  sendWalkInBookingEmail,
  sendMonthlySubscriptionPaymentEmail,
  sendSubscriptionCancelledEmail,
  sendSubscriptionReactivatedEmail,
  // Backward compatibility alias:
  sendInvoiceEmail: sendPaymentSuccessInvoiceEmail,
  sendOtpEmail: sendPasswordResetOtpEmail
};
