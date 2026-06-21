import { z } from 'zod'

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    twoFactorCode: z.string().optional(), // For admin 2FA verification
  }),
})

export const verify2FASchema = z.object({
  body: z.object({
    token: z.string().min(6, 'TOTP code must be 6 digits').max(6),
  }),
})

export const checkoutSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
      })
    ).min(1, 'At least one item is required'),
    discountCode: z.string().optional(),
    shippingAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      phone: z.string().min(5, 'Phone number is required'),
    }),
  }),
})

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    functionTag: z.string().min(1, 'Function tag is required'),
    price: z.number().int().positive('Price must be a positive integer in NGN'),
    compareAtPrice: z.number().int().positive().nullable().optional(),
    stockQuantity: z.number().int().nonnegative('Stock cannot be negative'),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    tags: z.array(z.string()).default([]),
    isExcludedFromPromos: z.boolean().default(false),
  }),
})

export const discountSchema = z.object({
  body: z.object({
    code: z.string().min(3, 'Discount code must be at least 3 characters').optional().nullable(),
    type: z.enum(['percentage', 'fixed']),
    value: z.number().int().positive('Value must be a positive number'),
    appliesToProductIds: z.array(z.string().uuid()).default([]),
    global: z.boolean().default(false),
    startDate: z.string().datetime('Invalid start date (must be ISO-8601 string)'),
    endDate: z.string().datetime('Invalid end date (must be ISO-8601 string)'),
    active: z.boolean().default(true),
  }),
})

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
  }),
})

export const setTrackingNumberSchema = z.object({
  body: z.object({
    trackingNumber: z.string().min(2, 'Tracking number must be at least 2 characters'),
    logisticsCompany: z.string().min(2, 'Logistics company name is required'),
  }),
})
