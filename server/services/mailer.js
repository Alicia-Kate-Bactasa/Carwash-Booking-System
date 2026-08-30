const nodemailer = require('nodemailer');

// Configure SMTP Transporter (Gmail / Custom SMTP)
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
 * Send 6-digit OTP verification email for Password Reset or Account Verification
 */
const sendOtpEmail = async ({ to, otp, type = 'Password Reset' }) => {
  const from = process.env.SMTP_FROM || `"Montage Auto Studio" <${process.env.SMTP_USER || 'noreply@montageautostudio.com'}>`;
  const subject = type === 'Account Verification' 
    ? 'Verification Code - Montage Auto Studio'
    : 'Password Reset Code - Montage Auto Studio';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #eeeeee; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 10px; font-weight: bold; letter-spacing: 3px; color: #999999; text-transform: uppercase; display: block; margin-bottom: 4px;">Montage</span>
            <h2 style="color: #111111; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin: 0;">Auto Studio</h2>
        </div>

        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">

        <p style="font-size: 14px; color: #333333; line-height: 1.6;">Hello,</p>
        
        <p style="font-size: 14px; color: #333333; line-height: 1.6;">
            We received a request for <strong>${type}</strong> for your Montage Auto Studio account. Please use the 6-digit verification code below:
        </p>

        <div style="background-color: #f8f9fa; border: 2px solid #111111; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
            <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #888888; display: block; margin-bottom: 8px;">Verification Code</span>
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #111111; font-family: monospace;">${otp}</span>
        </div>

        <p style="color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
            This code is valid for 1 hour. Enter this code on the verification page to proceed.
        </p>

        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">

        <p style="font-size: 11px; color: #888888; text-align: center; margin: 0;">
            Thank you,<br>
            <strong>Montage Auto Studio Team</strong>
        </p>
    </div>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent
      });
      console.log(`✉️ Email sent successfully to ${to} (${type})`);
      return { success: true, delivered: true };
    } catch (error) {
      console.error(`❌ SMTP Email send error:`, error);
    }
  }

  // Fallback console log when SMTP is not configured yet
  console.log(`\n=================== EMAIL SIMULATION (NO SMTP PASS YET) ===================`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`VERIFICATION CODE (OTP): [ ${otp} ]`);
  console.log(`============================================================================\n`);

  return { success: true, delivered: false, simulated: true, otp };
};

/**
 * Send official invoice receipt email upon payment confirmation
 */
const sendInvoiceEmail = async ({ to, clientName, invoiceId, bookingId, serviceName, amount, date }) => {
  const from = process.env.SMTP_FROM || `"Montage Auto Studio" <${process.env.SMTP_USER || 'noreply@montageautostudio.com'}>`;
  const subject = `Booking & Payment Receipt - Invoice INV-${invoiceId}`;

  const formattedDate = date ? String(date).split('T')[0] : new Date().toISOString().split('T')[0];

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 15px; color: #333;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
                <td>
                    <span style="font-size: 9px; font-weight: bold; letter-spacing: 2px; color: #999; text-transform: uppercase;">Montage Auto Studio</span>
                    <h2 style="margin: 5px 0 0 0; color: #111; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">BOOKING RECEIPT</h2>
                </td>
                <td style="text-align: right; vertical-align: top;">
                    <span style="font-size: 11px; color: #777; display: block;">Invoice No: <strong>INV-${invoiceId}</strong></span>
                    <span style="font-size: 11px; color: #777; display: block;">Date: <strong>${formattedDate}</strong></span>
                </td>
            </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; line-height: 1.5;">
            <tr>
                <td style="width: 50%; padding-right: 15px; vertical-align: top;">
                    <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #999; display: block; margin-bottom: 5px;">Billed To:</span>
                    <strong>${clientName || 'Valued Customer'}</strong><br>
                    Email: ${to}<br>
                </td>
                <td style="width: 50%; padding-left: 15px; vertical-align: top;">
                    <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #999; display: block; margin-bottom: 5px;">From:</span>
                    <strong>Montage Auto Studio</strong><br>
                    Banilad, Mandaue City, Cebu
                </td>
            </tr>
        </table>

        <div style="background-color: #f8f9fa; border: 2px solid #111; padding: 15px; margin-bottom: 25px; border-radius: 8px; text-align: center;">
            <span style="font-size: 10px; text-transform: uppercase; color: #777; font-weight: bold; letter-spacing: 2px; display: block; margin-bottom: 5px;">Booking Reference ID</span>
            <strong style="font-size: 24px; color: #111; font-family: monospace;">MTG-${bookingId || 'SUB'}</strong>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
            <thead>
                <tr style="border-bottom: 2px solid #eee; text-align: left;">
                    <th style="padding: 10px 5px; color: #666; font-weight: bold;">Description</th>
                    <th style="padding: 10px 5px; color: #666; font-weight: bold; text-align: right; width: 100px;">Price</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #f9f9f9;">
                    <td style="padding: 12px 5px;">
                        <strong>${serviceName || 'Detailing Service'}</strong>
                    </td>
                    <td style="padding: 12px 5px; text-align: right; font-weight: bold;">₱${amount}</td>
                </tr>
            </tbody>
        </table>

        <div style="text-align: right; font-size: 16px; font-weight: bold; margin-top: 15px;">
            Total Paid: <span style="color: #111;">₱${amount}</span>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
        <p style="font-size: 11px; color: #888; text-align: center; margin: 0;">
            Thank you for choosing <strong>Montage Auto Studio</strong>!
        </p>
    </div>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html: htmlContent
      });
      console.log(`✉️ Invoice INV-${invoiceId} sent successfully to ${to}`);
      return { success: true, delivered: true };
    } catch (error) {
      console.error(`❌ SMTP Invoice email send error:`, error);
    }
  }

  // Fallback console log when SMTP is not configured yet
  console.log(`\n=================== INVOICE EMAIL SIMULATION (NO SMTP PASS YET) ===================`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`INVOICE ID: INV-${invoiceId} | AMOUNT: ₱${amount}`);
  console.log(`===================================================================================\n`);

  return { success: true, delivered: false, simulated: true };
};

module.exports = {
  sendOtpEmail,
  sendInvoiceEmail
};
