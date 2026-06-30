import { Router } from 'express'
import publicRoutes from './public.routes'
import adminRoutes from './admin.routes'
import { paystackWebhook } from '../controllers/webhook.controller'

const router = Router()

// The webhook must be handled before other routes and has a special body parsing requirement
router.post('/webhooks/paystack', paystackWebhook)

router.use(publicRoutes)
router.use(adminRoutes)

export default router