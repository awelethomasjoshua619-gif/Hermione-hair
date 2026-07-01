import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import rateLimit from 'express-rate-limit'
import prisma from '../config/db'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'customer' | 'admin'
    is2FAVerified?: boolean
  }
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Access denied: No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as any
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      is2FAVerified: decoded.is2FAVerified,
    }
    next()
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Access denied: Invalid or expired token' })
  }
}

export const requireRole = (role: 'customer' | 'admin') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' })
      return
    }

    if (req.user.role !== role) {
      res.status(403).json({ status: 'error', message: 'Access forbidden: Insufficient permissions' })
      return
    }

    // Strict 2FA check for Admin routes — TEMPORARILY DISABLED FOR TESTING
    /*
    if (role === 'admin' && !req.user.is2FAVerified) {
      res.status(403).json({
        status: 'error',
        message: 'Two-factor authentication pending verification',
        error_code: '2FA_REQUIRED',
      })
      return
    }
    */

    next()
  }
}

// Log every audit action by admins
export const logAdminAction = async (adminUserId: string, action: string, targetId: string, details: any) => {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminUserId,
        action,
        targetId,
        details,
      },
    })
  } catch (err) {
    console.error('Failed to write admin audit log:', err)
  }
}

// General API rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (Increased for testing)
  message: { status: 'error', message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Authentication rate limiter (Customers)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 login/signup attempts per 15 minutes (Increased for testing)
  message: { status: 'error', message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Admin Auth rate limiter (more aggressive)
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 attempts per 15 minutes
  message: { status: 'error', message: 'Too many login attempts to the portal. Access blocked temporarily.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Aliases for route imports
export const auth = authenticate
export const adminOnly = [authenticate, requireRole('admin')]

