import { Request, Response } from 'express'
import prisma from '../config/db'
import { AuthenticatedRequest, logAdminAction } from '../middlewares/auth'

export const adminCreateDiscount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { code, type, value, appliesToProductIds, global, startDate, endDate, active } = req.body

  try {
    if (code) {
      const existing = await prisma.discount.findUnique({ where: { code } })
      if (existing) {
        res.status(400).json({ status: 'error', message: 'Discount code already exists' })
        return
      }
    }

    const discount = await prisma.discount.create({
      data: {
        code: code || null,
        type,
        value,
        appliesToProductIds,
        global,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active,
      },
    })

    await logAdminAction(req.user!.id, 'created_discount', discount.id, { discount })

    res.status(201).json({ status: 'success', data: discount })
  } catch (error) {
    console.error('adminCreateDiscount error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const adminUpdateDiscount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const updates = req.body

  try {
    const discount = await prisma.discount.findUnique({ where: { id } })
    if (!discount) {
      res.status(404).json({ status: 'error', message: 'Discount not found' })
      return
    }

    if (updates.startDate) updates.startDate = new Date(updates.startDate)
    if (updates.endDate) updates.endDate = new Date(updates.endDate)

    const updated = await prisma.discount.update({
      where: { id },
      data: updates,
    })

    await logAdminAction(req.user!.id, 'updated_discount', id, { previous: discount, updated })

    res.json({ status: 'success', data: updated })
  } catch (error) {
    console.error('adminUpdateDiscount error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const adminGetDiscounts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { startDate: 'desc' },
    })
    res.json({ status: 'success', data: discounts })
  } catch (error) {
    console.error('adminGetDiscounts error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const validateDiscountCode = async (req: Request, res: Response): Promise<void> => {
  const { code, productIds } = req.body as { code: string; productIds: string[] }

  try {
    const discount = await prisma.discount.findUnique({ where: { code } })

    if (!discount || !discount.active) {
      res.status(400).json({ status: 'error', message: 'Invalid or inactive discount code' })
      return
    }

    const now = new Date()
    if (now < discount.startDate || now > discount.endDate) {
      res.status(400).json({ status: 'error', message: 'Discount code has expired or is not active yet' })
      return
    }

    // Determine eligibility
    let eligible = false
    let eligibleProductIds: string[] = []

    if (discount.global) {
      eligible = true
      eligibleProductIds = productIds
    } else {
      // Find overlap
      eligibleProductIds = productIds.filter((pid) => discount.appliesToProductIds.includes(pid))
      eligible = eligibleProductIds.length > 0
    }

    if (!eligible) {
      res.status(400).json({
        status: 'error',
        message: 'This discount code is not applicable to the products in your cart',
      })
      return
    }

    res.json({
      status: 'success',
      data: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        eligibleProductIds,
      },
    })
  } catch (error) {
    console.error('validateDiscountCode error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
