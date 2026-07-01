import { Router } from 'express'
import userRoutes from './user.routes'
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
} from '../controllers/auth.controller'
import {
  adminCreateDiscount,
  adminUpdateDiscount,
  adminGetDiscounts,
  validateDiscountCode,
} from '../controllers/discount.controller'
import {
  checkout,
  getMeOrders,
  adminGetOrders,
  adminUpdateOrderStatus,
  trackOrderPublic,
  adminSetTracking,
} from '../controllers/order.controller'
import {
  getProducts,
  getProductBySlug,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminTogglePromoExclusion,
} from '../controllers/product.controller'
import { paystackWebhook } from '../controllers/webhook.controller'
import {
  getVisitors,
  logVisit,
  getSalesAndRevenue,
  getTopSellers,
  getAdminHomeOverview,
  getAuditLogs,
} from '../controllers/analytics.controller'
import { auth, adminOnly } from '../middlewares/auth'

const router = Router()

// Auth routes
router.post('/auth/signup', signup)
router.post('/auth/login', login)
router.post('/auth/botanical-portal/login', login) // Admin login
router.post('/auth/refresh', refresh)
router.post('/auth/logout', auth, logout)
router.get('/auth/verify-email', verifyEmail)
router.post('/auth/resend-verification', resendVerification)
router.post('/auth/forgot-password', forgotPassword)
router.post('/auth/reset-password', resetPassword)
router.post('/auth/2fa/verify', verify2FA)

// Discount routes
router.post('/discounts/validate', validateDiscountCode)
router.get('/discounts', adminOnly, adminGetDiscounts)
router.post('/discounts', adminOnly, adminCreateDiscount)
router.put('/discounts/:id', adminOnly, adminUpdateDiscount)

// Order routes
router.get('/orders/track', trackOrderPublic)
router.post('/orders/checkout', auth, checkout)
router.get('/orders/me', auth, getMeOrders)
router.get('/orders', adminOnly, adminGetOrders)
router.patch('/orders/:id/status', adminOnly, adminUpdateOrderStatus)
router.post('/orders/:id/tracking', adminOnly, adminSetTracking)

// Product routes
router.get('/products', getProducts)
router.get('/products/:slug', getProductBySlug)
router.post('/products', adminOnly, adminCreateProduct)
router.put('/products/:id', adminOnly, adminUpdateProduct)
router.delete('/products/:id', adminOnly, adminDeleteProduct)
router.patch('/products/:id/toggle-promo', adminOnly, adminTogglePromoExclusion)

// Webhook routes
router.post('/webhooks/paystack', paystackWebhook)

// Analytics routes
router.post('/analytics/log-visit', logVisit)
router.get('/analytics/visitors', adminOnly, getVisitors)
router.get('/analytics/sales', adminOnly, getSalesAndRevenue)
router.get('/analytics/top-sellers', adminOnly, getTopSellers)
router.get('/analytics/overview', adminOnly, getAdminHomeOverview)
router.get('/analytics/audit-logs', adminOnly, getAuditLogs)

router.use('/users', userRoutes)

export default router
