import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PAYSTACK_SECRET_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
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
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASS: process.env.SMTP_PASS!,
  SMTP_FROM: process.env.SMTP_FROM!,
  TOTP_ENCRYPTION_KEY: process.env.TOTP_ENCRYPTION_KEY!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  PORT: parseInt(process.env.PORT || '5000', 10),
}
