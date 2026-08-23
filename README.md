# Montage Auto Studio

Montage Auto Studio is an auto detailing booking and subscription management web application.

---

## 📁 Repository Structure

```text
montageAutoStudio/
├── client/                      # 🎨 Frontend Web Application (HTML, JS, Assets)
│   ├── index.html               # Main Booking Portal
│   ├── dashboard.html           # Customer Dashboard
│   ├── admin.html               # Admin Portal
│   ├── config.js                # Frontend Configuration (Supabase & API URL)
│   ├── assets/                  # CSS styles, images, QR codes
│   └── scripts/                 # Client-side JavaScript modules
│
├── server/                      # 🚀 Dedicated Express.js REST API Backend
│   ├── server.js                # Express app entry point
│   ├── config/                  # DB connection and Supabase admin setup
│   ├── middleware/              # Auth verification & Zod request validation
│   ├── routes/                  # API endpoints (/services, /bookings, /payments, etc.)
│   ├── prisma/                  # Prisma schema & generated client
│   ├── package.json
│   └── .env.example
│
├── database/                    # 🗄️ Database Schemas & Dumps (Ignored in Git)
│   ├── postgres_schema.sql
│   └── supabase_schema.sql
│
├── docs/                        # 📚 Documentation & HTML Templates
│   └── email_templates.md
│
├── uploads/                     # 📁 User Uploaded Files (Payment Proofs)
└── README.md
```

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
The API server will run on `http://localhost:5000/api/v1`.

### 2. Frontend Client Setup
1. Open `client/config.js` and insert your Supabase credentials and API base URL:
   ```javascript
   window.SUPABASE_URL = "https://your-project.supabase.co";
   window.SUPABASE_ANON_KEY = "your-anon-key";
   window.API_BASE_URL = "http://localhost:5000/api/v1";
   ```
2. Serve the `client/` folder using any static HTTP server (e.g. Live Server in VS Code, `npx serve client`, or Python HTTP server):
   ```bash
   npx serve client
   ```