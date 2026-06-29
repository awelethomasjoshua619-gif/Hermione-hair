import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PAYSTACK_SECRET_KEY',
  'RESEND_API_KEY',
  'TOTP_ENCRYPTION_KEY',
  'FRONTEND_URL',
]

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`🚨 MISSING REQUIRED ENVIRONMENT VARIABLE: ${key}`)
    process.exit(1)
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  TOTP_ENCRYPTION_KEY: process.env.TOTP_ENCRYPTION_KEY!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || '',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || '',
  SEED_TEST_EMAIL: process.env.SEED_TEST_EMAIL || '',
  SEED_TEST_PASSWORD: process.env.SEED_TEST_PASSWORD || '',
}
