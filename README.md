# Montage Auto Studio

Montage Auto Studio is an auto detailing booking and subscription management web application built with Express.js backend and Vue.js frontend.

---

## 📁 Repository Structure

```text
montageAutoStudio/
├── client/                      # 🎨 Frontend Web Application (Vue.js, Vite, Tailwind CSS)
│   ├── src/                     # Vue Components, Views & Router
│   ├── assets/                  # CSS styles, images, assets
│   ├── config.js                # Frontend API Configuration
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # 🚀 Dedicated Express.js REST API Backend
│   ├── server.js                # Express app entry point
│   ├── config/                  # DB connection setup
│   ├── middleware/              # Auth verification & Zod request validation
│   ├── routes/                  # API endpoints (/services, /bookings, /payments, etc.)
│   ├── prisma/                  # Prisma schema & generated client
│   ├── package.json
│   └── .env.example            # Safe Environment Variable Template
│
├── database/                    # 🗄️ Database Schemas & Dumps (Ignored in Git)
├── uploads/                     # 📁 Storage for User Uploaded Payment Proofs (Ignored in Git)
└── README.md
```

---

## 🔒 Security Best Practices

When committing or pushing code to GitHub:
- **Never push secrets**: Always use environment variables (`.env`) for `JWT_SECRET`, database credentials, and API keys. Use `server/.env.example` as a safe template.
- **Uploads Privacy**: The `uploads/` directory contents are excluded from source control to protect user data and payment proof privacy.
- **Build Artifacts**: Compiled files (`dist/`) and log files (`*.log`) are ignored to keep the repository lightweight and clean.

---

## 🚀 Getting Started

### 1. Backend Server Setup
```bash
cd server

# Install dependencies
npm install

# Copy environment template & update credentials
cp .env.example .env

# Generate Prisma Client
npx prisma generate

# Start the Express API server
npm run dev
```
The API server runs on `http://localhost:5001/api/v1`.

### 2. Frontend Client Setup
```bash
cd client

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```