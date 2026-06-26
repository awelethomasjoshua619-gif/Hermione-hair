import { Request, Response } from 'express'
import prisma from '../config/db'
import { AuthenticatedRequest, logAdminAction } from '../middlewares/auth'

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { functionTag, search, tag, limit } = req.query as {
    functionTag?: string
    search?: string
    tag?: string
    limit?: string
  }

  try {
    const where: any = {}
    const take = limit ? Math.min(parseInt(limit), 500) : undefined

    if (functionTag) {
      where.functionTag = { equals: functionTag, mode: 'insensitive' }
    }

    if (tag) {
      where.tags = { has: tag }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(take && { take }),
    })

    res.json({ status: 'success', data: products })
  } catch (error) {
    console.error('getProducts error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params

  try {
    const product = await prisma.product.findUnique({ where: { slug } })

    if (!product) {
      res.status(404).json({ status: 'error', message: 'Product not found' })
      return
    }

    res.json({ status: 'success', data: product })
  } catch (error) {
    console.error('getProductBySlug error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const adminCreateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, description, functionTag, price, compareAtPrice, stockQuantity, images, tags, isExcludedFromPromos } = req.body
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

  try {
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      res.status(400).json({ status: 'error', message: 'A product with a similar name already exists' })
      return
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        functionTag,
        price,
        compareAtPrice: compareAtPrice || null,
        stockQuantity,
        images,
        tags,
        isExcludedFromPromos,
      },
    })

    // Write to audit log
    await logAdminAction(req.user!.id, 'created_product', product.id, { product })

    res.status(201).json({ status: 'success', data: product })
  } catch (error) {
    console.error('adminCreateProduct error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const adminUpdateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const body = req.body

  // Sanitize: only pick known Product model fields to prevent Prisma unknown-field errors
  const allowedFields: Record<string, any> = {}
  if (body.name !== undefined) {
    allowedFields.name = body.name
    allowedFields.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }
  if (body.description !== undefined) allowedFields.description = body.description
  if (body.functionTag !== undefined) allowedFields.functionTag = body.functionTag
  if (body.price !== undefined) allowedFields.price = typeof body.price === 'number' ? body.price : parseInt(body.price, 10)
  if (body.compareAtPrice !== undefined) allowedFields.compareAtPrice = body.compareAtPrice
  if (body.stockQuantity !== undefined) allowedFields.stockQuantity = typeof body.stockQuantity === 'number' ? body.stockQuantity : parseInt(body.stockQuantity, 10)
  if (body.images !== undefined) allowedFields.images = Array.isArray(body.images) ? body.images : []
  if (body.tags !== undefined) allowedFields.tags = Array.isArray(body.tags) ? body.tags : []
  if (body.isExcludedFromPromos !== undefined) allowedFields.isExcludedFromPromos = body.isExcludedFromPromos

  try {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      res.status(404).json({ status: 'error', message: 'Product not found' })
      return
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: allowedFields,
    })

    // Send success response immediately — don't let audit log failure mask it
    res.json({ status: 'success', data: updatedProduct })

    // Write to audit log (non-blocking, after response is sent)
    logAdminAction(req.user!.id, 'updated_product', id, { previous: product, updated: updatedProduct }).catch(() => {})
  } catch (error) {
    console.error('adminUpdateProduct error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const adminDeleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      res.status(404).json({ status: 'error', message: 'Product not found' })
      return
    }

    await prisma.product.delete({ where: { id } })

    // Write to audit log
    await logAdminAction(req.user!.id, 'deleted_product', id, { name: product.name })

    res.json({ status: 'success', message: 'Product deleted successfully' })
  } catch (error) {
    console.error('adminDeleteProduct error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export const adminTogglePromoExclusion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      res.status(404).json({ status: 'error', message: 'Product not found' })
      return
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isExcludedFromPromos: !product.isExcludedFromPromos },
    })

    await logAdminAction(req.user!.id, 'toggle_promo_exclusion', id, { isExcludedFromPromos: updated.isExcludedFromPromos })

    res.json({ status: 'success', data: updated })
  } catch (error) {
    console.error('adminTogglePromoExclusion error:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
