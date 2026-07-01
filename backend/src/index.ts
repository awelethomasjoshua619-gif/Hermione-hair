 import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { env } from './config/env'
import { globalLimiter } from './middlewares/auth'
import apiRouter from './routes/index.js'
import { ApiError } from './utils/errors'

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

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow server-to-server (no origin) and any allowed origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`)
      callback(new Error(`Blocked by CORS policy: ${origin}`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Temp-Token'],
}

app.use(cors(corsOptions))
// Explicitly handle preflight requests for all routes
app.options('*', cors(corsOptions))

// 3. Security Headers
app.use(helmet({
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}))

// 4. Global Rate Limiting
app.use('/api/', globalLimiter)

// 5. Request Logger
app.use(morgan('dev'))

// 6. Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 7. API Routes
app.use('/api', apiRouter)

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.path}`, err)

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ status: 'error', message: err.message })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid input data',
      errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
    })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field'
      return res.status(409).json({
        status: 'error',
        message: `A record with this ${target} already exists.`,
      })
    }
  }

  // Default to 500
  return res.status(500).json({
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