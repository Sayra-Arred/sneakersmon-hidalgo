// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(80),
    email: z.string().email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export const addressSchema = z.object({
  name: z.string().min(2, 'Ingresa un nombre').max(80),
  street: z.string().min(5, 'Ingresa la calle y número').max(200),
  colonia: z.string().min(2, 'Ingresa la colonia').max(100),
  city: z.string().min(2, 'Ingresa la ciudad').max(100),
  state: z.string().min(2, 'Ingresa el estado').max(100),
  postalCode: z.string().regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos'),
  phone: z.string().regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos'),
  references: z.string().max(300).optional(),
  isDefault: z.boolean().optional().default(false),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Ingresa el nombre del producto').max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  shortDescription: z.string().max(300).optional(),
  brandId: z.string().cuid('Selecciona una marca'),
  categoryId: z.string().cuid('Selecciona una categoría'),
  gender: z.enum(['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña']).optional(),
  colorway: z.string().max(100).optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  compareAtPrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  isLimitedEdition: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
})

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(30)
    .regex(/^[A-Z0-9_-]+$/, 'Solo letras mayúsculas, números, guiones y guiones bajos'),
  description: z.string().max(200).optional(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'SHIPPING', 'REFERRAL', 'VIP']),
  value: z.number().positive('El valor debe ser mayor a 0'),
  minOrder: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
})

export const orderSchema = z.object({
  addressId: z.string().cuid('Selecciona una dirección'),
  paymentMethod: z.enum(['STRIPE', 'MERCADOPAGO', 'SPEI']),
  couponCode: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Calificación mínima 1').max(5, 'Calificación máxima 5'),
  title: z.string().max(100).optional(),
  body: z.string().min(10, 'La reseña debe tener al menos 10 caracteres').max(2000),
  productId: z.string().cuid(),
})

export const dropSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  releaseDate: z.string().datetime(),
  price: z.number().positive().optional(),
  status: z.enum(['UPCOMING', 'LIVE', 'ENDED']).default('UPCOMING'),
  coverImage: z.string().url().optional(),
  isExclusive: z.boolean().default(false),
  maxPerUser: z.number().int().positive().optional(),
})

export const searchSchema = z.object({
  q: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  size: z.string().max(10).optional(),
  gender: z.string().max(20).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(24),
})

export const checkoutSchema = z.object({
  ...addressSchema.shape,
  paymentMethod: z.enum(['STRIPE', 'MERCADOPAGO', 'SPEI']),
  couponCode: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
  saveAddress: z.boolean().default(false),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CouponInput = z.infer<typeof couponSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type DropInput = z.infer<typeof dropSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
