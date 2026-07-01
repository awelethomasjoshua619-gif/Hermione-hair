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
import { auth, adminOnly, authLimiter, adminAuthLimiter } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import {
  signupSchema,
  loginSchema,
  verify2FASchema,
  checkoutSchema,
  productSchema,
  discountSchema,
  updateOrderStatusSchema,
  setTrackingNumberSchema,
} from '../utils/schemas'

const router = Router()

// Auth routes
router.post('/auth/signup', authLimiter, validate(signupSchema), signup)
router.post('/auth/login', authLimiter, validate(loginSchema), login)
router.post('/botanical-portal/login', adminAuthLimiter, validate(loginSchema), login) // Admin login (standard)
router.post('/auth/botanical-portal/login', adminAuthLimiter, validate(loginSchema), login) // Admin login (legacy/fallback)
router.post('/auth/refresh', authLimiter, refresh)
router.post('/auth/logout', auth, logout)
router.get('/auth/verify-email', verifyEmail)
router.post('/auth/resend-verification', authLimiter, resendVerification)
router.post('/auth/forgot-password', authLimiter, forgotPassword)
router.post('/auth/reset-password', authLimiter, resetPassword)
router.post('/auth/2fa/verify', authLimiter, validate(verify2FASchema), verify2FA)
router.post('/auth/verify-2fa', authLimiter, validate(verify2FASchema), verify2FA) // fallback/legacy

// Discount routes
router.post('/discounts/validate', validateDiscountCode)
router.get('/discounts', adminOnly, adminGetDiscounts)
router.get('/admin/discounts', adminOnly, adminGetDiscounts) // frontend compat
router.post('/discounts', adminOnly, validate(discountSchema), adminCreateDiscount)
router.post('/admin/discounts', adminOnly, validate(discountSchema), adminCreateDiscount) // frontend compat
router.put('/discounts/:id', adminOnly, validate(discountSchema), adminUpdateDiscount)
router.put('/admin/discounts/:id', adminOnly, validate(discountSchema), adminUpdateDiscount) // frontend compat
router.patch('/discounts/:id', adminOnly, validate(discountSchema), adminUpdateDiscount)
router.patch('/admin/discounts/:id', adminOnly, validate(discountSchema), adminUpdateDiscount) // frontend compat

// Order routes
router.get('/orders/track', trackOrderPublic)
router.post('/orders/checkout', auth, validate(checkoutSchema), checkout)
router.post('/cart/checkout', auth, validate(checkoutSchema), checkout) // fallback/legacy
router.get('/orders/me', auth, getMeOrders)
router.get('/orders', adminOnly, adminGetOrders)
router.get('/admin/orders', adminOnly, adminGetOrders) // frontend compat
router.patch('/orders/:id/status', adminOnly, validate(updateOrderStatusSchema), adminUpdateOrderStatus)
router.patch('/admin/orders/:id/status', adminOnly, validate(updateOrderStatusSchema), adminUpdateOrderStatus) // frontend compat
router.put('/orders/:id/status', adminOnly, validate(updateOrderStatusSchema), adminUpdateOrderStatus) // fallback
router.put('/admin/orders/:id/status', adminOnly, validate(updateOrderStatusSchema), adminUpdateOrderStatus) // fallback
router.patch('/orders/:id/tracking', adminOnly, validate(setTrackingNumberSchema), adminSetTracking)
router.patch('/admin/orders/:id/tracking', adminOnly, validate(setTrackingNumberSchema), adminSetTracking) // frontend compat
router.post('/orders/:id/tracking', adminOnly, validate(setTrackingNumberSchema), adminSetTracking) // fallback/legacy
router.post('/admin/orders/:id/tracking', adminOnly, validate(setTrackingNumberSchema), adminSetTracking) // fallback

// Product routes
router.get('/products', getProducts)
router.get('/products/:slug', getProductBySlug)
router.post('/products', adminOnly, validate(productSchema), adminCreateProduct)
router.post('/admin/products', adminOnly, validate(productSchema), adminCreateProduct) // frontend compat
router.put('/products/:id', adminOnly, adminUpdateProduct)
router.put('/admin/products/:id', adminOnly, adminUpdateProduct) // frontend compat
router.patch('/products/:id', adminOnly, adminUpdateProduct)
router.patch('/admin/products/:id', adminOnly, adminUpdateProduct) // frontend compat
router.delete('/products/:id', adminOnly, adminDeleteProduct)
router.delete('/admin/products/:id', adminOnly, adminDeleteProduct) // frontend compat
router.patch('/products/:id/toggle-promo', adminOnly, adminTogglePromoExclusion)
router.patch('/admin/products/:id/exclude', adminOnly, adminTogglePromoExclusion) // frontend compat

// Webhook routes
router.post('/webhooks/paystack', paystackWebhook)

// Analytics routes
router.post('/analytics/log-visit', logVisit)
router.post('/analytics/visit', logVisit) // fallback/legacy
router.get('/analytics/visitors', adminOnly, getVisitors)
router.get('/admin/analytics/visitors', adminOnly, getVisitors) // frontend compat
router.get('/analytics/sales', adminOnly, getSalesAndRevenue)
router.get('/admin/analytics/sales', adminOnly, getSalesAndRevenue) // frontend compat
router.get('/analytics/top-sellers', adminOnly, getTopSellers)
router.get('/admin/analytics/top-seller', adminOnly, getTopSellers) // frontend compat
router.get('/analytics/overview', adminOnly, getAdminHomeOverview)
router.get('/admin/analytics/overview', adminOnly, getAdminHomeOverview) // frontend compat
router.get('/analytics/audit-logs', adminOnly, getAuditLogs)
router.get('/admin/audit-log', adminOnly, getAuditLogs) // frontend compat

router.use('/users', userRoutes)
router.use('/admin/users', userRoutes) // frontend compat

export default router

