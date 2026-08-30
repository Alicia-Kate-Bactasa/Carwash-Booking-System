# Montage Auto Studio — Complete Email Templates Guide

This document contains all HTML email templates for **Montage Auto Studio**, split into **Supabase Auth Templates** (managed in the Supabase Dashboard) and **Transactional Email Templates** (used for invoices, rescheduling, and notifications).

---

## Part 1: Supabase Auth Email Templates (In-Dashboard)

Where to add: **Supabase Dashboard** -> **Project Settings** -> **Auth** -> **Email Templates**

---

### 1. Password Reset Template (6-Digit OTP Code)
* **Tab**: `Reset Password`
* **Subject**: `Password Reset Code - Montage Auto Studio`

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #eeeeee; border-radius: 16px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 10px; font-weight: bold; letter-spacing: 3px; color: #999999; text-transform: uppercase; display: block; margin-bottom: 4px;">Montage</span>
        <h2 style="color: #111111; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin: 0;">Auto Studio</h2>
    </div>

    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">

    <p style="font-size: 14px; color: #333333; line-height: 1.6;">Hello,</p>
    
    <p style="font-size: 14px; color: #333333; line-height: 1.6;">
        We received a request to reset the password for your <strong>Montage Auto Studio</strong> account. Please use the 6-digit verification code below:
    </p>

    <div style="background-color: #f8f9fa; border: 2px solid #111111; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; tracking: 2px; color: #888888; display: block; margin-bottom: 8px;">Verification Code</span>
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #111111; font-family: monospace;">{{ .Token }}</span>
    </div>

    <p style="color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
        This code is valid for 1 hour. Enter this code on the password reset page to create a new password.
    </p>

    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">

    <p style="font-size: 11px; color: #888888; text-align: center; margin: 0;">
        Thank you,<br>
        <strong>Montage Auto Studio Team</strong>
    </p>
</div>
```

---

### 2. Confirm Signup / Verification Code Template
* **Tab**: `Confirm Signup`
* **Subject**: `Verification Code - Montage Auto Studio`

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #eeeeee; border-radius: 16px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 10px; font-weight: bold; letter-spacing: 3px; color: #999999; text-transform: uppercase; display: block; margin-bottom: 4px;">Montage</span>
        <h2 style="color: #111111; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin: 0;">Auto Studio</h2>
    </div>

    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">

    <p style="font-size: 14px; color: #333333; line-height: 1.6;">Welcome to Montage Auto Studio!</p>

    <p style="font-size: 14px; color: #333333; line-height: 1.6;">
        Thank you for registering. Please enter the 6-digit code below on the website to verify your account:
    </p>

    <div style="background-color: #f8f9fa; border: 2px solid #111111; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; tracking: 2px; color: #888888; display: block; margin-bottom: 8px;">Verification Code</span>
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #111111; font-family: monospace;">{{ .Token }}</span>
    </div>

    <p style="color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
        If you did not request this verification code, please ignore this message.
    </p>

    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">

    <p style="font-size: 11px; color: #888888; text-align: center; margin: 0;">
        Thank you,<br>
        <strong>Montage Auto Studio Team</strong>
    </p>
</div>
```

---

### 3. Magic Link / One-Time OTP Template
* **Tab**: `Magic Link / OTP`
* **Subject**: `Your OTP Verification Code - Montage Auto Studio`

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #eeeeee; border-radius: 16px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 10px; font-weight: bold; letter-spacing: 3px; color: #999999; text-transform: uppercase; display: block; margin-bottom: 4px;">Montage</span>
        <h2 style="color: #111111; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin: 0;">Auto Studio</h2>
    </div>

    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">

    <p style="font-size: 14px; color: #333333; line-height: 1.6;">Hello,</p>
    
    <p style="font-size: 14px; color: #333333; line-height: 1.6;">
        To complete your verification on Montage Auto Studio, please enter the 6-digit code below:
    </p>

    <div style="background-color: #f8f9fa; border: 2px solid #111111; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; tracking: 2px; color: #888888; display: block; margin-bottom: 8px;">Verification Code</span>
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #111111; font-family: monospace;">{{ .Token }}</span>
    </div>

    <p style="color: #888888; font-size: 12px; line-height: 1.5; text-align: center;">
        This code is valid for 5 minutes. If you did not request this email, please ignore it.
    </p>

    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">

    <p style="font-size: 11px; color: #888888; text-align: center; margin: 0;">
        Thank you,<br>
        <strong>Montage Auto Studio Team</strong>
    </p>
</div>
```

---

## Part 2: Transactional Email Templates (Invoices & Notifications)

Use these templates with transactional email providers like **Resend.com**, **EmailJS**, or **Supabase Database Webhooks**.

---

### 4. Official Booking & Payment Invoice Receipt
* **Trigger**: When a booking is created, or when payment status is updated to `Paid`.

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); color: #333;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
            <td>
                <span style="font-size: 9px; font-weight: bold; letter-spacing: 2px; color: #999; text-transform: uppercase;">Montage Auto Studio</span>
                <h2 style="margin: 5px 0 0 0; color: #111; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">BOOKING RECEIPT</h2>
            </td>
            <td style="text-align: right; vertical-align: top;">
                <span style="font-size: 11px; color: #777; display: block;">Invoice No: <strong>INV-{{ invoice_id }}</strong></span>
                <span style="font-size: 11px; color: #777; display: block;">Date: <strong>{{ date }}</strong></span>
            </td>
        </tr>
    </table>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; line-height: 1.5;">
        <tr>
            <td style="width: 50%; padding-right: 15px; vertical-align: top;">
                <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #999; display: block; margin-bottom: 5px;">Billed To:</span>
                <strong>{{ client_name }}</strong><br>
                Email: {{ client_email }}<br>
            </td>
            <td style="width: 50%; padding-left: 15px; vertical-align: top;">
                <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #999; display: block; margin-bottom: 5px;">From:</span>
                <strong>Montage Auto Studio</strong><br>
                Near Mango Green Village, Banilad, Mandaue City, Cebu
            </td>
        </tr>
    </table>

    <div style="background-color: #f8f9fa; border: 2px solid #111; padding: 15px; margin-bottom: 25px; border-radius: 8px; text-align: center;">
        <span style="font-size: 10px; text-transform: uppercase; color: #777; font-weight: bold; letter-spacing: 2px; display: block; margin-bottom: 5px;">Booking Reference ID</span>
        <strong style="font-size: 24px; color: #111; font-family: monospace;">MTG-{{ booking_id }}</strong>
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
                    <strong>{{ service_name }}</strong>
                    <span style="font-size: 11px; color: #777; display: block; margin-top: 3px;">Scheduled for {{ scheduled_date }} at {{ time_slot }}</span>
                </td>
                <td style="padding: 12px 5px; text-align: right; font-weight: bold;">₱{{ price }}</td>
            </tr>
        </tbody>
    </table>

    <div style="text-align: right; font-size: 16px; font-weight: bold; margin-top: 15px;">
        Total Paid: <span style="color: #111;">₱{{ total_amount }}</span>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
    <p style="font-size: 11px; color: #888; text-align: center; margin: 0;">
        Thank you for choosing <strong>Montage Auto Studio</strong>!
    </p>
</div>
```

---

### 5. Reschedule Confirmation Notification
* **Trigger**: When an appointment is rescheduled.

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); color: #333;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
            <td>
                <span style="font-size: 9px; font-weight: bold; letter-spacing: 2px; color: #999; text-transform: uppercase;">Montage Auto Studio</span>
                <h2 style="margin: 5px 0 0 0; color: #111; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">Reschedule Confirmation</h2>
            </td>
        </tr>
    </table>
    
    <p style="font-size: 14px;">Hello <strong>{{ client_name }}</strong>,</p>

    <div style="background-color: #f4fdf7; border-left: 4px solid #27ae60; padding: 18px; margin-bottom: 25px; border-radius: 8px; font-size: 13px; color: #1e7e34; line-height: 1.6;">
        <strong style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Appointment Rescheduled</strong><br><br>
        Your appointment for <strong>{{ service_name }}</strong> (Ref: <strong>MTG-{{ booking_id }}</strong>) has been successfully rescheduled to:
        <br><br>
        📅 <strong>Date:</strong> {{ new_date }}<br>
        ⏰ <strong>Time Slot:</strong> {{ new_time }}
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
    <p style="font-size: 11px; color: #888; text-align: center; margin: 0;">
        Thank you,<br>
        <strong>Montage Auto Studio Team</strong>
    </p>
</div>
```

---

### 6. Appointment Cancellation Notification
* **Trigger**: When a booking is cancelled.

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); color: #333;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
            <td>
                <span style="font-size: 9px; font-weight: bold; letter-spacing: 2px; color: #999; text-transform: uppercase;">Montage Auto Studio</span>
                <h2 style="margin: 5px 0 0 0; color: #111; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">Cancellation Notice</h2>
            </td>
        </tr>
    </table>
    
    <p style="font-size: 14px;">Hello <strong>{{ client_name }}</strong>,</p>

    <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 18px; margin-bottom: 25px; border-radius: 8px; font-size: 13px; color: #c53030; line-height: 1.6;">
        <strong style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Appointment Cancelled</strong><br><br>
        Your appointment for <strong>{{ service_name }}</strong> (Ref: <strong>MTG-{{ booking_id }}</strong>) scheduled for <strong>{{ date }}</strong> has been cancelled.
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
    <p style="font-size: 11px; color: #888; text-align: center; margin: 0;">
        Thank you,<br>
        <strong>Montage Auto Studio Team</strong>
    </p>
</div>
```
