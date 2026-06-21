import { Response } from 'express'
import prisma from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth'

// Constants
const ACTIVE_THRESHOLD_DAYS = 30

export const adminGetUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { status, search, page = 1, limit = 10 } = req.query as any
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10)

  try {
    const activeThresholdDate = new Date()
    activeThresholdDate.setDate(activeThresholdDate.getDate() - ACTIVE_THRESHOLD_DAYS)

    const where: any = {
      role: 'customer',
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status === 'active') {
      where.lastSeenAt = { gte: activeThresholdDate }
    } else if (status === 'inactive') {
      where.lastSeenAt = { lt: activeThresholdDate }
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          orders: {
            where: { status: { in: ['paid', 'shipped', 'delivered'] } },
            select: { totalAmount: true },
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit, 10),
      }),
      prisma.user.count({ where }),
    ])

    // Format output with computed status and lifetime value metrics
    const formattedUsers = users.map((u) => {
      const totalLifetimeSpend = u.orders.reduce((sum, o) => sum + o.totalAmount, 0)
      const isActive = u.lastSeenAt >= activeThresholdDate

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        lastSeenAt: u.lastSeenAt,
        status: isActive ? 'active' : 'inactive',
        totalOrders: u._count.orders,
        lifetimeSpend: totalLifetimeSpend,
      }
    })

    res.json({
      status: 'success',
      data: formattedUsers,
      pagination: {
        total: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(totalCount / parseInt(limit, 10)),
      },
    })
  } catch (error) {
    console.error('adminGetUsers error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
