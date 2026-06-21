import { Request, Response } from 'express'
import crypto from 'crypto'
import prisma from '../config/db'
import { env } from '../config/env'
import { emailService } from '../services/email.service'

export const paystackWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['x-paystack-signature'] as string

  if (!signature) {
    res.status(401).json({ status: 'error', message: 'Missing signature header' })
    return
  }

  // 1. Verify webhook signature
  // We need to use req.body directly. If express.json() was used, we can recalculate from req.body or raw body.
  // Note: We will configure express.json() to supply the raw body on the request object for verification.
  const rawBody = (req as any).rawBody || JSON.stringify(req.body)
  const hash = crypto
    .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex')

  if (hash !== signature) {
    res.status(400).json({ status: 'error', message: 'Invalid webhook signature' })
    return
  }

  const event = req.body

  if (event.event === 'charge.success') {
    const data = event.data
    const reference = data.reference
    const paidAmountKobo = data.amount

    try {
      // Find the order
      const order = await prisma.order.findUnique({
        where: { paystackReference: reference },
        include: {
          user: { select: { email: true, name: true } },
          orderItems: { include: { product: true } },
        },
      })

      if (!order) {
        console.warn(`Webhook Warn: Order with reference ${reference} not found in database`)
        res.status(200).send('Event received, order not found')
        return
      }

      // Idempotency: If already paid/shipped, resolve successfully without doing anything
      if (order.status !== 'pending') {
        console.log(`Webhook Log: Order ${order.id} is already processed (Status: ${order.status})`)
        res.status(200).send('Order already completed')
        return
      }

      // Check amount matching
      const expectedAmountKobo = order.totalAmount * 100
      if (paidAmountKobo < expectedAmountKobo) {
        console.error(`Webhook Error: Amount mismatch for order ${order.id}. Expected ${expectedAmountKobo} kobo, received ${paidAmountKobo} kobo.`)
        res.status(200).send('Amount mismatch logged')
        return
      }

      // Process payment in database transaction
      await prisma.$transaction(async (tx) => {
        // Mark order as paid
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'paid' },
        })

        // Decrement product stock levels
        for (const item of order.orderItems) {
          const product = await tx.product.findUnique({ where: { id: item.productId } })
          if (!product) {
            throw new Error(`Product ${item.productId} not found`)
          }

          const newStock = Math.max(0, product.stockQuantity - item.quantity)
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: newStock },
          })
        }
      })

      // Send order confirmation email
      emailService.sendOrderConfirmation(
        order.user.email,
        order.id,
        order.orderItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
        })),
        order.totalAmount,
        order.shippingAddress
      )

      console.log(`Webhook Success: Order ${order.id} marked as PAID and stock decremented.`)
    } catch (err) {
      console.error('Webhook processing transaction failed:', err)
      // Paystack expects 200 OK eventually, but we can throw 500 so they retry if it failed at DB transaction level
      res.status(500).json({ status: 'error', message: 'Transaction processing failed' })
      return
    }
  }

  // Acknowledge receipt of the webhook event
  res.status(200).send('Webhook processed successfully')
}
