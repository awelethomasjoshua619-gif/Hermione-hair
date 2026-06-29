 import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from './config/db'
import { env } from './config/env'
import {
  signup, login, verify2FA, verifyEmail, refresh,
  logout, resendVerification, forgotPassword, resetPassword,
} from './controllers/auth.controller'
import {
  getProducts, getProductBySlug, adminCreateProduct,
  adminUpdateProduct, adminDeleteProduct, adminTogglePromoExclusion,
} from './controllers/product.controller'
import {
  adminCreateDiscount, adminUpdateDiscount,
  adminGetDiscounts, validateDiscountCode,
} from './controllers/discount.controller'
import {
  checkout, getMeOrders, trackOrderPublic,
  adminGetOrders, adminUpdateOrderStatus, adminSetTracking,
} from './controllers/order.controller'
import { paystackWebhook } from './controllers/webhook.controller'
import {
  getVisitors, getSalesAndRevenue, getTopSellers,
  getAdminHomeOverview, getAuditLogs,
} from './controllers/analytics.controller'
import { adminGetUsers, adminDeleteUser, adminEmailUser } from './controllers/user.controller'
import {
  authenticate, requireRole, globalLimiter, authLimiter, adminAuthLimiter,
} from './middlewares/auth'
import { validate } from './middlewares/validate'
import {
  signupSchema, loginSchema, verify2FASchema, checkoutSchema,
  productSchema, discountSchema, updateOrderStatusSchema,
  setTrackingNumberSchema, adminEmailCustomerSchema,
} from './utils/schemas'

const app = express()

// 1. Webhook Raw Body Support
app.use(
  express.json({
    limit: '10kb',
    verify: (req: any, res, buf) => {
      if (req.originalUrl.startsWith('/api/webhooks/paystack')) {
        req.rawBody = buf.toString()
      }
    },
  })
)
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// 2. CORS — always allow the configured FRONTEND_URL plus localhost for dev
const allowedOrigins = [
  env.FRONTEND_URL,                       // e.g. https://hermionehair.com
  'https://hermionehair.com',             // always allow main domain
  'https://www.hermionehair.com',         // www variant
  'http://localhost:5173',                // Vite dev
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server (no origin) and any allowed origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`)
        callback(new Error(`Blocked by CORS policy: ${origin}`))
      }
    },
    credentials: true,
  })
)

// 3. Security Headers
app.use(helmet())

// 4. Global Rate Limiting
app.use('/api/', globalLimiter)

// 5. Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ==========================================
// PUBLIC / CUSTOMER ROUTES
// ==========================================

app.post('/api/webhooks/paystack', paystackWebhook)

// Auth
app.post('/api/auth/signup', authLimiter, validate(signupSchema), signup)
app.post('/api/auth/login', authLimiter, validate(loginSchema), login)
app.post('/api/auth/verify-2fa', authLimiter, validate(verify2FASchema), verify2FA)
app.get('/api/auth/verify-email', verifyEmail)
app.post('/api/auth/resend-verification', authLimiter, resendVerification)
app.post('/api/auth/forgot-password', authLimiter, forgotPassword)
app.post('/api/auth/reset-password', authLimiter, resetPassword)
app.post('/api/auth/refresh', authLimiter, refresh)
app.post('/api/auth/logout', logout)

// Products
app.get('/api/products', getProducts)
app.get('/api/products/:slug', getProductBySlug)

// Orders
app.post('/api/cart/checkout', authenticate, requireRole('customer'), validate(checkoutSchema), checkout)
app.get('/api/orders/me', authenticate, requireRole('customer'), getMeOrders)
app.get('/api/orders/track', globalLimiter, trackOrderPublic)

// Discounts
app.post('/api/discount/validate', authLimiter, validateDiscountCode)

// Visitor Tracker
app.post('/api/analytics/visit', globalLimiter, async (req, res) => {
  const rawPath = req.body.path
  const path = typeof rawPath === 'string' ? rawPath.slice(0, 200) : '/'

  const ip =
    (req.headers['x-forwarded-for'] as string) ||
    req.socket.remoteAddress ||
    'anonymous'

  const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

  let userId: string | null = null
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, env.JWT_SECRET) as any
      userId = decoded.id
    } catch (e) {
      // Ignore invalid token for guest visits
    }
  }

  try {
    const visit = await prisma.siteVisit.create({
      data: { path, ipHash, userId },
    })
    res.status(201).json({ status: 'success', data: { id: visit.id } })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to log visit' })
  }
})

// ==========================================
// ADMIN ROUTES — FULLY PROTECTED
// ==========================================

const adminAuthMiddleware = [authenticate, requireRole('admin')]

app.post('/api/botanical-portal/login', adminAuthLimiter, validate(loginSchema), login)

// Analytics
app.get('/api/admin/analytics/overview', adminAuthMiddleware, getAdminHomeOverview)
app.get('/api/admin/analytics/visitors', adminAuthMiddleware, getVisitors)
app.get('/api/admin/analytics/sales', adminAuthMiddleware, getSalesAndRevenue)
app.get('/api/admin/analytics/revenue', adminAuthMiddleware, getSalesAndRevenue)
app.get('/api/admin/analytics/top-seller', adminAuthMiddleware, getTopSellers)

// Products
app.post('/api/admin/products', adminAuthMiddleware, validate(productSchema), adminCreateProduct)
app.patch('/api/admin/products/:id', adminAuthMiddleware, adminUpdateProduct)
app.delete('/api/admin/products/:id', adminAuthMiddleware, adminDeleteProduct)
app.patch('/api/admin/products/:id/exclude', adminAuthMiddleware, adminTogglePromoExclusion)

// Discounts
app.post('/api/admin/discounts', adminAuthMiddleware, validate(discountSchema), adminCreateDiscount)
app.patch('/api/admin/discounts/:id', adminAuthMiddleware, adminUpdateDiscount)
app.get('/api/admin/discounts', adminAuthMiddleware, adminGetDiscounts)

// Orders
app.get('/api/admin/orders', adminAuthMiddleware, adminGetOrders)
app.patch('/api/admin/orders/:id/status', adminAuthMiddleware, validate(updateOrderStatusSchema), adminUpdateOrderStatus)
app.patch('/api/admin/orders/:id/tracking', adminAuthMiddleware, validate(setTrackingNumberSchema), adminSetTracking)

// Users & Logs
app.get('/api/admin/users', adminAuthMiddleware, adminGetUsers)
app.post('/api/admin/users/:id/email', adminAuthMiddleware, validate(adminEmailCustomerSchema), adminEmailUser)
app.delete('/api/admin/users/:id', adminAuthMiddleware, adminDeleteUser)
app.get('/api/admin/audit-log', adminAuthMiddleware, getAuditLogs)

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err)
  res.status(500).json({
    status: 'error',
    message: 'An unexpected internal server error occurred.',
  })
})

// ==========================================
// START SERVER
// ==========================================

app.listen(env.PORT, () => {
  console.log(`🚀 Hermione Hair API running on http://localhost:${env.PORT}`)
})