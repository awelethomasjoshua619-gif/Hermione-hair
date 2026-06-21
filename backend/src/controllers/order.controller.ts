import { Response } from 'express'
import axios from 'axios'
import prisma from '../config/db'
import { env } from '../config/env'
import { AuthenticatedRequest, logAdminAction } from '../middlewares/auth'
import { emailService } from '../services/email.service'

export const checkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { items, discountCode, shippingAddress } = req.body
  const userId = req.user!.id

  try {
    // 1. Verify email is verified before checkout
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isVerified) {
      res.status(400).json({
        status: 'error',
        message: 'Please verify your email address before checking out.',
      })
      return
    }

    // 2. Fetch all products to recompute pricing on server-side (never trust client)
    const productIds = items.map((item: any) => item.productId)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    if (dbProducts.length !== items.length) {
      res.status(400).json({ status: 'error', message: 'One or more products in your cart are invalid' })
      return
    }

    let subtotal = 0
    const orderItemsToCreate: any[] = []

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId)!

      // Verify stock availability
      if (dbProduct.stockQuantity < item.quantity) {
        res.status(400).json({
          status: 'error',
          message: `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.stockQuantity}`,
        })
        return
      }

      const itemCost = dbProduct.price * item.quantity
      subtotal += itemCost

      orderItemsToCreate.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        priceAtPurchase: dbProduct.price,
      })
    }

    // 3. Apply Discount Code (if provided)
    let total = subtotal
    if (discountCode) {
      const discount = await prisma.discount.findUnique({
        where: { code: discountCode },
      })

      const now = new Date()
      if (
        discount &&
        discount.active &&
        now >= discount.startDate &&
        now <= discount.endDate
      ) {
        let discountDeduction = 0

        // Calculate eligible discount amount
        for (const oItem of orderItemsToCreate) {
          const product = dbProducts.find((p) => p.id === oItem.productId)!

          // Check if product is excluded from promotions
          if (product.isExcludedFromPromos) continue

          // Check if discount applies globally or to this product specifically
          if (discount.global || discount.appliesToProductIds.includes(product.id)) {
            const itemTotal = oItem.priceAtPurchase * oItem.quantity
            if (discount.type === 'percentage') {
              discountDeduction += Math.round(itemTotal * (discount.value / 100))
            } else if (discount.type === 'fixed') {
              // Fixed splits across eligible items proportionally or simply deducts up to item cost
              discountDeduction += Math.min(discount.value, itemTotal)
            }
          }
        }

        total = Math.max(0, total - discountDeduction)
      }
    }

    // Paystack reference
    const paystackReference = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // 4. Create Order (Pending state) in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'pending',
          totalAmount: total,
          paystackReference,
          shippingAddress,
        },
      })

      await tx.orderItem.createMany({
        data: orderItemsToCreate.map((item) => ({
          ...item,
          orderId: newOrder.id,
        })),
      })

      return newOrder
    })

    // 5. Initialize Paystack Transaction
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: total * 100, // Paystack amount is in kobo
        reference: paystackReference,
        callback_url: `${env.FRONTEND_URL}/payment-callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (paystackResponse.data && paystackResponse.data.status) {
      res.json({
        status: 'success',
        data: {
          orderId: order.id,
          reference: paystackReference,
          authorization_url: paystackResponse.data.data.authorization_url,
        },
      })
    } else {
      throw new Error('Paystack initialization failed')
    }
  } catch (error: any) {
    console.error('Checkout error:', error?.response?.data || error)
    res.status(500).json({ status: 'error', message: 'Checkout initialization failed' })
  }
}

export const getMeOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: { select: { name: true, images: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ status: 'success', data: orders })
  } catch (error) {
    console.error('getMeOrders error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const adminGetOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, search = '' } = req.query as any
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10)

  try {
    const where: any = {}

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { paystackReference: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          orderItems: { include: { product: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit, 10),
      }),
      prisma.order.count({ where }),
    ])

    res.json({
      status: 'success',
      data: orders,
      pagination: {
        total: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(totalCount / parseInt(limit, 10)),
      },
    })
  } catch (error) {
    console.error('adminGetOrders error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const adminUpdateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { status } = req.body

  try {
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      res.status(404).json({ status: 'error', message: 'Order not found' })
      return
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    })

    await logAdminAction(req.user!.id, 'changed_order_status', id, { previous: order.status, updated: status })

    res.json({ status: 'success', data: updated })
  } catch (error) {
    console.error('adminUpdateOrderStatus error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const adminSetTracking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { trackingNumber, logisticsCompany } = req.body

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!order) {
      res.status(404).json({ status: 'error', message: 'Order not found' })
      return
    }

    // Set order status to shipped, and save tracking details
    const updated = await prisma.order.update({
      where: { id },
      data: {
        trackingNumber,
        status: order.status === 'pending' || order.status === 'paid' ? 'shipped' : order.status,
      },
    })

    // Write to admin audit logs
    await logAdminAction(req.user!.id, 'set_tracking_number', id, {
      trackingNumber,
      logisticsCompany,
    })

    // Trigger non-blocking transactional email notification
    emailService.sendTrackingNotification(
      order.user.email,
      order.id,
      trackingNumber,
      logisticsCompany
    )

    res.json({ status: 'success', data: updated })
  } catch (error) {
    console.error('adminSetTracking error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
