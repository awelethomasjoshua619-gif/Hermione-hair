import { Router } from 'express'
import { login } from '../controllers/auth.controller'
import {
  adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminTogglePromoExclusion,
} from '../controllers/product.controller'
import {
  adminCreateDiscount, adminUpdateDiscount, adminGetDiscounts,
} from '../controllers/discount.controller'
import {
  adminGetOrders, adminUpdateOrderStatus, adminSetTracking,
} from '../controllers/order.controller'
import {
  getSalesAndRevenue, getTopSellers,
  getAdminHomeOverview, getAuditLogs, getVisitors,
} from '../controllers/analytics.controller'
import { adminGetUsers, adminDeleteUser, adminEmailUser } from '../controllers/user.controller'
import { authenticate, requireRole, adminAuthLimiter } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import {
  loginSchema, productSchema, discountSchema, updateOrderStatusSchema,
  setTrackingNumberSchema, adminEmailCustomerSchema,
} from '../utils/schemas'

const router = Router()
const adminAuthMiddleware = [authenticate, requireRole('admin')]

// Admin Login
router.post('/botanical-portal/login', adminAuthLimiter, validate(loginSchema), login)

// Analytics
router.get('/admin/analytics/overview', adminAuthMiddleware, getAdminHomeOverview)
router.get('/admin/analytics/visitors', adminAuthMiddleware, getVisitors)
router.get('/admin/analytics/sales', adminAuthMiddleware, getSalesAndRevenue)
router.get('/admin/analytics/revenue', adminAuthMiddleware, getSalesAndRevenue)
router.get('/admin/analytics/top-seller', adminAuthMiddleware, getTopSellers)

// Products
router.post('/admin/products', adminAuthMiddleware, validate(productSchema), adminCreateProduct)
router.patch('/admin/products/:id', adminAuthMiddleware, adminUpdateProduct)
router.delete('/admin/products/:id', adminAuthMiddleware, adminDeleteProduct)
router.patch('/admin/products/:id/exclude', adminAuthMiddleware, adminTogglePromoExclusion)

// Discounts
router.post('/admin/discounts', adminAuthMiddleware, validate(discountSchema), adminCreateDiscount)
router.patch('/admin/discounts/:id', adminAuthMiddleware, adminUpdateDiscount)
router.get('/admin/discounts', adminAuthMiddleware, adminGetDiscounts)

// Orders
router.get('/admin/orders', adminAuthMiddleware, adminGetOrders)
router.patch('/admin/orders/:id/status', adminAuthMiddleware, validate(updateOrderStatusSchema), adminUpdateOrderStatus)
router.patch('/admin/orders/:id/tracking', adminAuthMiddleware, validate(setTrackingNumberSchema), adminSetTracking)

// Users & Logs
router.get('/admin/users', adminAuthMiddleware, adminGetUsers)
router.post('/admin/users/:id/email', adminAuthMiddleware, validate(adminEmailCustomerSchema), adminEmailUser)
router.delete('/admin/users/:id', adminAuthMiddleware, adminDeleteUser)
router.get('/admin/audit-log', adminAuthMiddleware, getAuditLogs)

export default router