# Montage Auto Studio

Montage Auto Studio is a full-stack auto detailing reservation and VIP membership subscription web application built with Express.js backend and Vue.js 3 frontend, powered by Prisma ORM and Neon PostgreSQL database integration.

---

## Tech Stack

### Frontend
![Vue.js 3](https://img.shields.io/badge/Vue.js_3-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vue Router](https://img.shields.io/badge/Vue_Router-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### Backend & Database
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-0298C3?style=for-the-badge&logo=gmail&logoColor=white)
![PayMongo API](https://img.shields.io/badge/PayMongo_API-0052FF?style=for-the-badge&logo=contactlesspayment&logoColor=white)

---

## System Overview

Montage Auto Studio offers structured auto detailing scheduling and membership management with distinct workflows:

- **Guest Booking Wizard**: Allows walk-in and guest customers to browse active detailing packages, select service durations, check studio bay availability in real time, and proceed through online checkout.
- **VIP Subscriber Hub**: Enables active subscribers to book complimentary detailing sessions with 0 PHP per-session transaction invoices, manage billing cycles, reschedule, or cancel appointments.
- **Admin Management Control**: Provides studio administrators with live service package CRUD (activation/deactivation, duration setting, pricing updates), walk-in booking management, payment tracking with linked booking IDs, and recharts analytics for customer feedback.
- **Transaction Invoicing & HTML Email Service**: Sends structured HTML email confirmations for bookings, payments, cancellations, reschedules, and password resets with exact booking ID and invoice reference cards.

---

## Repository Structure

```text
montageAutoStudio/
├── client/                      # Frontend Web Application (Vue.js 3, Vite, Tailwind CSS)
│   ├── src/
│   │   ├── components/          # Reusable UI components (ServiceSelector, Modals)
│   │   ├── views/               # Page views (HomeView, DashboardView, AdminView, etc.)
│   │   ├── router/              # Vue Router navigation mapping
│   │   └── style.css            # Custom CSS styling and animations
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express.js REST API Backend
│   ├── server.js                # Server entry point
│   ├── middleware/              # Auth verification and input validation
│   ├── routes/                  # API routes (/auth, /services, /bookings, /subscriptions, /payments, /feedback)
│   ├── services/                # Mailer service and external integrations
│   ├── prisma/                  # Prisma ORM schema definition
│   ├── package.json
│   └── .env.example             # Environment variable configuration template
│
└── README.md
```

---

## Database Architecture

The application uses Prisma ORM connected to Neon PostgreSQL:

- **User**: Mapped table users supporting Subscriber and Admin user profiles with bcrypt password hashing.
- **Service**: Mapped table services storing detailing packages (service_name, service_price, service_duration, service_description, is_active).
- **Booking**: Mapped table bookings tracking appointment sessions, time slots, bay assignments, and status (Pending_Verification, Confirmed, Completed, Cancelled).
- **Invoice**: Mapped table invoices generating single detailing or monthly membership subscription invoices.
- **Subscription**: Mapped table subscriptions tracking VIP membership plan status (Active, Cancelled), last billing date, and next billing date.
- **Feedback**: Mapped table feedbacks capturing ratings (1-5 stars) and customer reviews verified against completed booking IDs.

---

## Security and Environment Configuration

- **Environment Isolation**: Sensitive keys such as DATABASE_URL, JWT_SECRET, PAYMONGO_SECRET_KEY, and RESEND_API_KEY are defined inside server/.env.
- **Git Ignore Safeguards**: .env, environment overrides (*.env), user file uploads, log files (*.log), and build artifacts (dist/, node_modules/) are strictly excluded via .gitignore.
- **Schema Safety**: server/prisma/schema.prisma contains structural table definitions only and references dynamic environment variables without hardcoded credentials.

---

## Getting Started

### 1. Backend Setup

```bash
cd server

# Install backend dependencies
npm install

# Copy environment variable template
cp .env.example .env

# Generate Prisma Client
npx prisma generate

# Start Express REST API server
npm run dev
```

The REST API server will run on http://localhost:5001/api/v1.

### 2. Frontend Setup

```bash
cd client

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend application will run on http://localhost:5173.

### 3. Production Build

To build the production frontend bundle:

```bash
cd client
npm run build
```
