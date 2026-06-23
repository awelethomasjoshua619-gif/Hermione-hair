import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import crypto from 'crypto'
import prisma from './config/db'
import { env } from './config/env'
import {
  signup,
  login,
  verify2FA,
  verifyEmail,
  refresh,
  logout,
  resendVerification,
  forgotPassword,
  resetPassword,
} from './controllers/auth.controller'
import {
  getProducts,
  getProductBySlug,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminTogglePromoExclusion,
} from './controllers/product.controller'
import {
  adminCreateDiscount,
  adminUpdateDiscount,
  adminGetDiscounts,
  validateDiscountCode,
} from './controllers/discount.controller'
import {
  checkout,
  getMeOrders,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminSetTracking,
} from './controllers/order.controller'
import { paystackWebhook } from './controllers/webhook.controller'
import {
  getVisitors,
  getSalesAndRevenue,
  getTopSellers,
  getAdminHomeOverview,
  getAuditLogs,
} from './controllers/analytics.controller'
import { adminGetUsers } from './controllers/user.controller'
import {
  authenticate,
  requireRole,
  globalLimiter,
  authLimiter,
  adminAuthLimiter,
} from './middlewares/auth'
import { validate } from './middlewares/validate'
import {
  signupSchema,
  loginSchema,
  verify2FASchema,
  checkoutSchema,
  productSchema,
  discountSchema,
  updateOrderStatusSchema,
  setTrackingNumberSchema,
} from './utils/schemas'

const app = express()

// 1. Webhook Raw Body Support
// Paystack webhook signature needs the raw, unmodified request body
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      if (req.originalUrl.startsWith('/api/webhooks/paystack')) {
        req.rawBody = buf.toString()
      }
    },
  })
)

app.use(express.urlencoded({ extended: true }))

// 2. CORS configuration
// Restricts access to the Netlify domain in production and localhost in development
const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.startsWith('http://172.') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.trycloudflare.com') ||
        origin.endsWith('.loca.lt')
      ) {
        callback(null, true)
      } else {
        callback(new Error(`Blocked by CORS policy: Request origin ${origin} not allowed.`))
      }
    },
    credentials: true,
  })
)

// 3. Security Headers via Helmet
app.use(helmet())

// 4. Rate Limiting
app.use('/api/', globalLimiter)

// Log incoming request paths (debug / diagnostic)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ==========================================
// PUBLIC / CUSTOMER ROUTER
// ==========================================

// Paystack Webhook - strictly processed before body-parser changes raw content
app.post('/api/webhooks/paystack', paystackWebhook)

// Auth Endpoints
app.post('/api/auth/signup', authLimiter, validate(signupSchema), signup)
app.post('/api/auth/login', authLimiter, validate(loginSchema), login)
app.post('/api/auth/verify-2fa', authLimiter, validate(verify2FASchema), verify2FA)
app.get('/api/auth/verify-email', verifyEmail)
app.post('/api/auth/resend-verification', authLimiter, resendVerification)
app.post('/api/auth/forgot-password', authLimiter, forgotPassword)
app.post('/api/auth/reset-password', authLimiter, resetPassword)
app.post('/api/auth/refresh', refresh)
app.post('/api/auth/logout', logout)

// Public Products
app.get('/api/products', getProducts)
app.get('/api/products/:slug', getProductBySlug)

// Checkout & Orders (Requires Authentication)
app.post('/api/cart/checkout', authenticate, requireRole('customer'), validate(checkoutSchema), checkout)
app.get('/api/orders/me', authenticate, requireRole('customer'), getMeOrders)

// Public Discounts
app.post('/api/discount/validate', validateDiscountCode)

// Public Visitor Tracker
app.post('/api/analytics/visit', async (req, res) => {
  const { path } = req.body
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'anonymous'

  // Hash IP to respect privacy
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

  // Extract optional authenticated user
  const authHeader = req.headers.authorization
  let userId: string | null = null

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
      data: {
        path: path || '/',
        ipHash,
        userId,
      },
    })
    res.status(201).json({ status: 'success', data: { id: visit.id } })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to log visit' })
  }
})

// Helper import for visitor decoding
import jwt from 'jsonwebtoken'

// ==========================================
// ADMIN ROUTER (STRICT AUTHENTICATION)
// ==========================================

// Hidden Login Path & aggressive Rate Limiting for Admin
app.post('/api/botanical-portal/login', adminAuthLimiter, validate(loginSchema), login)

// Middleware groups for Admin validation
const adminAuthMiddleware = [] // Authentication disabled for development

// Analytics
app.get('/api/admin/analytics/overview', adminAuthMiddleware, getAdminHomeOverview)
app.get('/api/admin/analytics/visitors', adminAuthMiddleware, getVisitors)
app.get('/api/admin/analytics/sales', adminAuthMiddleware, getSalesAndRevenue)
app.get('/api/admin/analytics/revenue', adminAuthMiddleware, getSalesAndRevenue) // Shares sales/revenue query endpoint
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
app.get('/api/admin/audit-log', adminAuthMiddleware, getAuditLogs)

// Global generic error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err)
  res.status(500).json({
    status: 'error',
    message: 'An unexpected internal server error occurred.',
  })
})

// Automatically seed/reset the test user on startup
import bcrypt from 'bcryptjs'
async function resetTestUser() {
  try {
    const email = 'dragon66199@gmail.com'
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash('Testing12345', salt)
    
    await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        isVerified: true
      },
      create: {
        name: 'Joshua',
        email,
        passwordHash,
        role: 'customer',
        isVerified: true
      }
    })
    console.log(`[Startup] ✅ Test user ${email} password set to "Testing12345" and verified.`)

    const adminEmail = 'admin@hermionehair.com'
    const adminPasswordHash = await bcrypt.hash('Admin12345!', salt)
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash: adminPasswordHash,
        role: 'admin',
        isVerified: true
      },
      create: {
        name: 'Admin',
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: 'admin',
        isVerified: true
      }
    })
    console.log(`[Startup] ✅ Admin user ${adminEmail} password set to "Admin12345!".`)
  } catch (err) {
    console.error('Failed to reset test user on startup:', err)
  }
}
resetTestUser()

// Start Server
app.listen(env.PORT, () => {
  console.log(`🚀 Hermione Hair API running on http://localhost:${env.PORT}`)
})
