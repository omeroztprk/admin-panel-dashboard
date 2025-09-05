const dotenv = require('dotenv');
dotenv.config();

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets must be provided in environment variables');
}

if (process.env.JWT_ACCESS_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT secrets must be at least 32 characters long');
}

const TFA_ENABLED = process.env.TFA_ENABLED === 'true';
if (TFA_ENABLED && (!process.env.GMAIL_USER || !process.env.GMAIL_PASS)) {
  throw new Error('TFA enabled but GMAIL_USER / GMAIL_PASS not set');
}

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/admin-panel-dashboard',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
  TFA_ENABLED,
  TFA_CODE_TTL_SECONDS: parseInt(process.env.TFA_CODE_TTL_SECONDS || '300', 10),
  TFA_MAX_ATTEMPTS: parseInt(process.env.TFA_MAX_ATTEMPTS || '5', 10),
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_PASS: process.env.GMAIL_PASS,
};