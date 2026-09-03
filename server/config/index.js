/**
 * Centralized environment + security configuration for Montage Auto Studio.
 * Loads environment variables from server/.env or root .env, resolves the
 * JWT signing secret, and exposes shared config to the rest of the app.
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from server/.env or root .env (first match wins)
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
  path.join(process.cwd(), 'server/.env'),
  path.join(process.cwd(), '.env')
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
    break;
  }
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

/**
 * JWT signing secret. A hardcoded fallback is intentionally NOT provided so a
 * misconfigured deployment fails fast instead of silently using a known secret.
 */
const JWT_SECRET = process.env.JWT_SECRET;

if (isProduction && !JWT_SECRET) {
  console.error('CRITICAL SECURITY WARNING: JWT_SECRET environment variable is missing in production!');
}

module.exports = {
  NODE_ENV,
  isProduction,
  JWT_SECRET,
  PORT: process.env.PORT || 5001,
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
};
