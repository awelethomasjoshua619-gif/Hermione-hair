import { Router } from 'express'
import {
  signup, login, verify2FA, verifyEmail, refresh,
  logout, resendVerification, forgotPassword, resetPassword,
} from '../controllers/auth.controller'
import { getProducts, getProductBySlug } from '../controllers/product.controller'
import { validateDiscountCode } from '../controllers/discount.controller'
import { checkout, getMeOrders, trackOrderPublic } from '../controllers/order.controller'
import { logVisit } from '../controllers/analytics.controller'
import { authenticate, requireRole, globalLimiter, authLimiter } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { signupSchema, loginSchema, verify2FASchema, checkoutSchema } from '../utils/schemas'

const router = Router()

// Auth
router.post('/auth/signup', authLimiter, validate(signupSchema), signup)
router.post('/auth/login', authLimiter, validate(loginSchema), login)
router.post('/auth/verify-2fa', authLimiter, validate(verify2FASchema), verify2FA)
router.get('/auth/verify-email', verifyEmail)
router.post('/auth/resend-verification', authLimiter, resendVerification)
router.post('/auth/forgot-password', authLimiter, forgotPassword)
router.post('/auth/reset-password', authLimiter, resetPassword)
router.post('/auth/refresh', authLimiter, refresh)
router.post('/auth/logout', logout)

// Products
router.get('/products', getProducts)
router.get('/products/:slug', getProductBySlug)

// Orders
router.post('/cart/checkout', authenticate, requireRole('customer'), validate(checkoutSchema), checkout)
router.get('/orders/me', authenticate, requireRole('customer'), getMeOrders)
router.get('/orders/track', globalLimiter, trackOrderPublic)

// Discounts
router.post('/discount/validate', authLimiter, validateDiscountCode)

// Visitor Tracker
router.post('/analytics/visit', globalLimiter, logVisit)

export default router