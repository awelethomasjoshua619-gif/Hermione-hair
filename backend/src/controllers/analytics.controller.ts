import { Response } from 'express'
import prisma from '../config/db'
import { AuthenticatedRequest } from '../middlewares/auth'

const getStartDate = (period: string): Date => {
  const days = period === 'month' ? 30 : 7
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(0, 0, 0, 0)
  return date
}

export const getVisitors = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const period = (req.query.period as string) === 'month' ? 'month' : 'week'
  const startDate = getStartDate(period)

  try {
    const visits = await prisma.siteVisit.findMany({
      where: { timestamp: { gte: startDate } },
      orderBy: { timestamp: 'asc' },
    })

    // Group visits by date
    const grouped: { [key: string]: { total: number; unique: Set<string> } } = {}
    const daysCount = period === 'month' ? 30 : 7

    for (let i = 0; i < daysCount; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      grouped[dateStr] = { total: 0, unique: new Set() }
    }

    visits.forEach((v) => {
      const dateStr = v.timestamp.toISOString().split('T')[0]
      if (grouped[dateStr]) {
        grouped[dateStr].total += 1
        grouped[dateStr].unique.add(v.ipHash)
      }
    })

    const chartData = Object.keys(grouped)
      .sort()
      .map((date) => ({
        date,
        visits: grouped[date].total,
        uniqueVisitors: grouped[date].unique.size,
      }))

    const totalVisits = visits.length
    const uniqueIPs = new Set(visits.map((v) => v.ipHash)).size

    res.json({
      status: 'success',
      data: {
        totalVisits,
        uniqueVisitors: uniqueIPs,
        chartData,
      },
    })
  } catch (error) {
    console.error('getVisitors analytics error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const getSalesAndRevenue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const period = (req.query.period as string) === 'month' ? 'month' : 'week'
  const startDate = getStartDate(period)

  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['paid', 'shipped', 'delivered'] },
      },
      include: {
        orderItems: {
          include: { product: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group revenue by date
    const groupedRev: { [key: string]: number } = {}
    const daysCount = period === 'month' ? 30 : 7

    for (let i = 0; i < daysCount; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      groupedRev[dateStr] = 0
    }

    let totalRevenue = 0
    let totalItemsSold = 0

    orders.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split('T')[0]
      if (groupedRev[dateStr] !== undefined) {
        groupedRev[dateStr] += order.totalAmount
      }
      totalRevenue += order.totalAmount

      order.orderItems.forEach((item) => {
        totalItemsSold += item.quantity
      })
    })

    const chartData = Object.keys(groupedRev)
      .sort()
      .map((date) => ({
        date,
        revenue: groupedRev[date],
      }))

    res.json({
      status: 'success',
      data: {
        totalRevenue,
        totalOrders: orders.length,
        totalItemsSold,
        chartData,
      },
    })
  } catch (error) {
    console.error('getSalesAndRevenue error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const getTopSellers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const period = (req.query.period as string) === 'month' ? 'month' : 'week'
  const startDate = getStartDate(period)

  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['paid', 'shipped', 'delivered'] },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    })

    const productStats: {
      [key: string]: {
        productId: string
        name: string
        unitsSold: number
        revenue: number
      }
    } = {}

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            productId: item.productId,
            name: item.product.name,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productStats[item.productId].unitsSold += item.quantity
        productStats[item.productId].revenue += item.quantity * item.priceAtPurchase
      })
    })

    const statsArray = Object.values(productStats)

    const topByUnits = [...statsArray].sort((a, b) => b.unitsSold - a.unitsSold)
    const topByRevenue = [...statsArray].sort((a, b) => b.revenue - a.revenue)

    res.json({
      status: 'success',
      data: {
        topByUnits: topByUnits.slice(0, 5),
        topByRevenue: topByRevenue.slice(0, 5),
      },
    })
  } catch (error) {
    console.error('getTopSellers error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const getAdminHomeOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 1. Low stock products (threshold: 10 units)
    const LOW_STOCK_THRESHOLD = 10
    const lowStockProducts = await prisma.product.findMany({
      where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stockQuantity: 'asc' },
    })

    // 2. Recent activities feed (last 10 items total)
    // - Paid orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })

    // - New user signups
    const recentUsers = await prisma.user.findMany({
      where: { role: 'customer' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    // - Recent admin actions
    const recentAuditLogs = await prisma.adminAuditLog.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
    })

    // Format activities
    const activities: any[] = []

    recentOrders.forEach((o) => {
      activities.push({
        type: 'order',
        title: `New order from ${o.user.name}`,
        desc: `Order for NGN ${o.totalAmount} was placed (${o.status})`,
        timestamp: o.createdAt,
      })
    })

    recentUsers.forEach((u) => {
      activities.push({
        type: 'signup',
        title: 'New customer signed up',
        desc: `${u.name} (${u.email}) joined the tribe`,
        timestamp: u.createdAt,
      })
    })

    recentAuditLogs.forEach((a) => {
      activities.push({
        type: 'audit',
        title: `Admin Action: ${a.action.replace(/_/g, ' ')}`,
        desc: `Modified target ID: ${a.targetId}`,
        timestamp: a.timestamp,
      })
    })

    // Sort combined activities descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // 3. Current General Stats
    const totalSales = await prisma.order.aggregate({
      where: { status: { in: ['paid', 'shipped', 'delivered'] } },
      _sum: { totalAmount: true },
    })

    const totalOrdersCount = await prisma.order.count()
    const totalCustomersCount = await prisma.user.count({ where: { role: 'customer' } })

    res.json({
      status: 'success',
      data: {
        lowStock: lowStockProducts,
        activities: activities.slice(0, 10),
        stats: {
          lifetimeRevenue: totalSales._sum.totalAmount || 0,
          totalOrders: totalOrdersCount,
          totalCustomers: totalCustomersCount,
        },
      },
    })
  } catch (error) {
    console.error('getAdminHomeOverview error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to recent 100
    })
    res.json({ status: 'success', data: logs })
  } catch (error) {
    console.error('getAuditLogs error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
