import { Router } from 'express'
import { adminGetUsers, adminEmailUser, adminDeleteUser } from '../controllers/user.controller'
import { adminOnly } from '../middlewares/auth'

import { validate } from '../middlewares/validate'
import { adminEmailCustomerSchema } from '../utils/schemas'

const router = Router()

// All routes in this file are admin-protected
router.use(adminOnly)

router.get('/', adminGetUsers)
router.post('/:id/email', validate(adminEmailCustomerSchema), adminEmailUser)
router.delete('/:id', adminDeleteUser)

export default router
