import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authenticator } from 'otplib'
import qrcode from 'qrcode'
import prisma from '../config/db'
import { env } from '../config/env'
import { encrypt, decrypt } from '../utils/crypto'
import { emailService } from '../services/email.service'
import crypto from 'crypto'

const generateTokens = (user: { id: string; email: string; role: string }, is2FAVerified: boolean) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, is2FAVerified },
    env.JWT_SECRET,
    { expiresIn: user.role === 'admin' ? '30m' : '7d' } // Admin token expires in 30 minutes, Customer in 7 days
  )

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: user.role === 'admin' ? '2h' : '30d' }
  )

  return { accessToken, refreshToken }
}

// Generate a cryptographically secure 6-digit code
const generateSecureCode = (): string => {
  return crypto.randomInt(100000, 1000000).toString()
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body
  const normalizedEmail = email.trim().toLowerCase()

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'Email address already registered' })
      return
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)
    const verificationToken = generateSecureCode()

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: 'customer',
        verificationToken,
        isVerified: false, // Require email verification
      },
    })

    // Log the verification token to the console for local testing/development
    console.log(`[TESTING] Verification code for ${user.email} is: ${verificationToken}`)

    // Send non-blocking verification email (failsafe)
    emailService.sendVerificationEmail(user.email, user.name, verificationToken)

    const { accessToken, refreshToken } = generateTokens(user, false)

    res.status(201).json({
      status: 'pending_verification',
      message: 'Registration successful. Please check your email for the verification code.',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body
  const normalizedEmail = email.trim().toLowerCase()
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      // Only log failed admin login attempts (not customer attempts) for audit purposes
      if (normalizedEmail.includes('@hermionehair.com')) {
        try {
          await prisma.adminLoginLog.create({
            data: { emailAttempted: normalizedEmail, ip, userAgent, success: false },
          })
        } catch (logError) {
          console.error('Failed to log admin attempt:', logError)
        }
      }
      res.status(401).json({ status: 'error', message: 'Invalid email or password' })
      return
    }

    // Distinguish admin login vs customer login routes to prevent user enumeration
    const isAdminRoute = req.originalUrl.includes('/botanical-portal')

    if (user.role === 'admin' && !isAdminRoute) {
      res.status(401).json({ status: 'error', message: 'Invalid email or password' })
      return
    }

    if (user.role === 'customer' && isAdminRoute) {
      res.status(401).json({ status: 'error', message: 'Invalid email or password' })
      return
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      if (user.role === 'admin') {
        try {
          await prisma.adminLoginLog.create({
            data: { adminUserId: user.id, emailAttempted: normalizedEmail, ip, userAgent, success: false },
          })
        } catch (logError) {
          console.error('Failed to log admin attempt:', logError)
        }
      }
      res.status(401).json({ status: 'error', message: 'Invalid email or password' })
      return
    }

    if (!user.isVerified) {
      res.status(403).json({
        status: 'pending_verification',
        message: 'Your email address is not verified. Please check your email for the verification code.',
      })
      return
    }

    // Update lastSeenAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    })

    // Handle Admin Auth (Strict 2FA Check)
    if (user.role === 'admin') {
      // If 2FA is enabled, require code verification
      if (user.twoFactorEnabled && user.twoFactorSecret) {
        const tempToken = jwt.sign({ id: user.id, role: 'admin' }, env.JWT_SECRET, { expiresIn: '5m' })
        
        try {
          await prisma.adminLoginLog.create({
            data: { adminUserId: user.id, emailAttempted: normalizedEmail, ip, userAgent, success: true, action: '2FA_CHALLENGE_ISSUED' },
          })
        } catch (logError) {
          console.error('Failed to log admin 2FA challenge:', logError)
        }

        return res.json({
          status: '2fa_required',
          message: 'Please enter your 2FA code to complete login.',
          data: { tempToken },
        })
      }

      // If 2FA is NOT enabled, force setup for security
      const secret = authenticator.generateSecret()
      const encryptedSecret = encrypt(secret)
      const appName = 'HermioneHair Admin'
      const otpauth = authenticator.keyuri(user.email, appName, secret)

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: encryptedSecret },
      })

      const qrCodeDataUrl = await qrcode.toDataURL(otpauth)
      const tempToken = jwt.sign({ id: user.id, role: 'admin', setup: true }, env.JWT_SECRET, { expiresIn: '10m' })

      try {
        await prisma.adminLoginLog.create({
          data: { adminUserId: user.id, emailAttempted: normalizedEmail, ip, userAgent, success: true, action: '2FA_SETUP_ISSUED' },
        })
      } catch (logError) {
        console.error('Failed to log admin 2FA setup:', logError)
      }

      return res.json({
        status: '2fa_setup_required',
        message: 'Two-Factor Authentication is required. Please scan the QR code and verify to continue.',
        data: {
          tempToken,
          qrCode: qrCodeDataUrl,
          secret, // For manual entry in authenticator app
        },
      })
    }

    const { accessToken, refreshToken } = generateTokens(user, false) // Customer login is not 2FA verified

    res.json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error. Please try again.' })
  }
}

export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body
  const tempTokenHeader = req.headers['x-temp-token'] as string
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'

  if (!tempTokenHeader) {
    res.status(400).json({ status: 'error', message: 'Verification temporary token required' })
    return
  }

  try {
    const decoded = jwt.verify(tempTokenHeader, env.JWT_SECRET) as any
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })

    if (!user || user.role !== 'admin' || !user.twoFactorSecret) {
      res.status(401).json({ status: 'error', message: 'Unauthorized verification attempt' })
      return
    }

    const decryptedSecret = decrypt(user.twoFactorSecret)
    const isValid = authenticator.check(token, decryptedSecret)

    if (!isValid) {
      // Log failed admin login (2FA code mismatch)
      try {
        await prisma.adminLoginLog.create({
          data: { adminUserId: user.id, emailAttempted: user.email, ip, userAgent, success: false },
        })
      } catch (logError) {
        console.error('Failed to log admin 2FA attempt:', logError)
      }
      res.status(400).json({ status: 'error', message: 'Invalid 2FA code' })
      return
    }

    // Enable 2FA permanently if setup state
    if (decoded.setup && !user.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      })
    }

    // Log successful login
    try {
      await prisma.adminLoginLog.create({
        data: { adminUserId: user.id, emailAttempted: user.email, ip, userAgent, success: true },
      })
    } catch (logError) {
      console.error('Failed to log admin successful login:', logError)
    }

    const { accessToken, refreshToken } = generateTokens(user, true)

    res.json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('2FA Verification error:', error)
    res.status(401).json({ status: 'error', message: 'Session expired or invalid temporary token' })
  }
}

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token, email } = req.query as { token: string; email: string }
  const normalizedEmail = email ? email.trim().toLowerCase() : ''

  try {
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail, verificationToken: token },
    })

    if (!user) {
      res.status(400).json({ status: 'error', message: 'Invalid verification token or email mismatch' })
      return
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    })

    const { accessToken, refreshToken } = generateTokens(updatedUser, false)

    res.json({
      status: 'success',
      message: 'Your email has been successfully verified!',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
        },
      },
    })
  } catch (error) {
    console.error('Email verification error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    res.status(400).json({ status: 'error', message: 'Refresh token is required' })
    return
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized session' })
      return
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, false)

    res.json({
      status: 'success',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Your session has expired. Please log in again.' })
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  // Stateless JWT logout is handled on client by deleting tokens.
  // We return a simple confirmation message.
  res.json({ status: 'success', message: 'Logged out successfully' })
}

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body
  const normalizedEmail = email ? email.trim().toLowerCase() : ''

  if (!normalizedEmail) {
    res.status(400).json({ status: 'error', message: 'Email address is required' })
    return
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      // For security, return generic success even if user not found, so we don't disclose emails
      res.json({ status: 'success', message: 'If the email is registered, a new verification code has been sent.' })
      return
    }

    if (user.isVerified) {
      res.status(400).json({ status: 'error', message: 'This account is already verified. Please log in.' })
      return
    }

    const verificationToken = generateSecureCode()

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    })

    // Send verification email non-blocking
    emailService.sendVerificationEmail(user.email, user.name, verificationToken)

    res.json({ status: 'success', message: 'A new 6-digit verification code has been sent to your email.' })
  } catch (error) {
    console.error('Resend verification error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body
  const normalizedEmail = email ? email.trim().toLowerCase() : ''

  if (!normalizedEmail) {
    res.status(400).json({ status: 'error', message: 'Email address is required' })
    return
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    // Always return success for security (don't reveal if email exists)
    if (!user || user.role === 'admin') {
      res.json({
        status: 'success',
        message: 'If this email is registered, a password reset code has been sent.',
      })
      return
    }

    const resetToken = generateSecureCode()

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: `reset:${resetToken}` }, // Prefix to distinguish from signup token
    })

    // Send password reset email
    emailService.sendPasswordResetEmail(user.email, user.name, resetToken)

    res.json({
      status: 'success',
      message: 'If this email is registered, a password reset code has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, resetCode, newPassword } = req.body
  const normalizedEmail = email ? email.trim().toLowerCase() : ''

  if (!normalizedEmail || !resetCode || !newPassword) {
    res.status(400).json({ status: 'error', message: 'Email, reset code, and new password are required' })
    return
  }

  if (newPassword.length < 8) {
    res.status(400).json({ status: 'error', message: 'New password must be at least 8 characters' })
    return
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        verificationToken: `reset:${resetCode}`,
      },
    })

    if (!user) {
      res.status(400).json({ status: 'error', message: 'Invalid or expired reset code' })
      return
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        verificationToken: null, // Clear the reset token
        isVerified: true, // Also verify the account if it wasn't already
      },
    })

    res.json({ status: 'success', message: 'Your password has been reset successfully. You can now log in.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
