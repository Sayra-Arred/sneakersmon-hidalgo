// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/security'
import { generateSlug } from '@/lib/utils'
import type { ActionResult } from '@/types'

function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

export interface VariantInput {
  id?: string
  size: string
  sku: string
  price?: number | null
  stock: number
  isActive: boolean
}

export interface ImageInput {
  url: string
  altText?: string
  order: number
  isPrimary: boolean
}

export interface FullProductInput {
  name: string
  slug?: string
  description: string
  shortDescription?: string
  brandId: string
  categoryId: string
  gender?: string
  colorway?: string
  price: number
  compareAtPrice?: number
  cost?: number
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  isFeatured: boolean
  isLimitedEdition: boolean
  isBestSeller: boolean
  isNewArrival: boolean
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  images: ImageInput[]
  variants: VariantInput[]
}

export async function createFullProduct(data: FullProductInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) return { success: false, error: 'No autorizado' }

  const slug = data.slug && data.slug.length > 0 ? data.slug : generateSlug(data.name)

  // Check slug uniqueness
  const existing = await db.product.findUnique({ where: { slug } })
  if (existing) return { success: false, error: `El slug "${slug}" ya está en uso` }

  const product = await db.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      shortDescription: data.shortDescription,
      brandId: data.brandId,
      categoryId: data.categoryId,
      gender: data.gender,
      colorway: data.colorway,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      cost: data.cost,
      status: data.status,
      isFeatured: data.isFeatured,
      isLimitedEdition: data.isLimitedEdition,
      isBestSeller: data.isBestSeller,
      isNewArrival: data.isNewArrival,
      tags: data.tags,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    },
  })

  // Create images
  if (data.images.length > 0) {
    await db.productImage.createMany({
      data: data.images.map((img) => ({
        productId: product.id,
        url: img.url,
        altText: img.altText,
        order: img.order,
        isPrimary: img.isPrimary,
      })),
    })
  }

  // Create variants + inventory
  for (const v of data.variants) {
    const variant = await db.productVariant.create({
      data: {
        productId: product.id,
        size: v.size,
        sku: v.sku,
        price: v.price,
        isActive: v.isActive,
      },
    })
    await db.inventory.create({
      data: {
        variantId: variant.id,
        quantity: v.stock,
        reserved: 0,
      },
    })
  }

  await createAuditLog({
    userId: session.user.id,
    action: 'CREATE_PRODUCT_FULL',
    entity: 'Product',
    entityId: product.id,
  })

  revalidatePath('/admin/products')
  revalidatePath('/catalog')

  return { success: true, data: { id: product.id, slug: product.slug } }
}

export async function updateFullProduct(
  id: string,
  data: FullProductInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) return { success: false, error: 'No autorizado' }

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) return { success: false, error: 'Producto no encontrado' }

  const slug = data.slug && data.slug.length > 0 ? data.slug : generateSlug(data.name)

  // Check slug uniqueness (excluding self)
  const slugConflict = await db.product.findFirst({ where: { slug, id: { not: id } } })
  if (slugConflict) return { success: false, error: `El slug "${slug}" ya está en uso` }

  const product = await db.product.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description,
      shortDescription: data.shortDescription,
      brandId: data.brandId,
      categoryId: data.categoryId,
      gender: data.gender,
      colorway: data.colorway,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      cost: data.cost ?? null,
      status: data.status,
      isFeatured: data.isFeatured,
      isLimitedEdition: data.isLimitedEdition,
      isBestSeller: data.isBestSeller,
      isNewArrival: data.isNewArrival,
      tags: data.tags,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    },
  })

  // Replace images
  await db.productImage.deleteMany({ where: { productId: id } })
  if (data.images.length > 0) {
    await db.productImage.createMany({
      data: data.images.map((img) => ({
        productId: id,
        url: img.url,
        altText: img.altText,
        order: img.order,
        isPrimary: img.isPrimary,
      })),
    })
  }

  // Upsert variants
  const existingVariants = await db.productVariant.findMany({ where: { productId: id } })
  const incomingIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id!))

  // Delete removed variants
  for (const ev of existingVariants) {
    if (!incomingIds.has(ev.id)) {
      await db.productVariant.delete({ where: { id: ev.id } })
    }
  }

  // Upsert incoming
  for (const v of data.variants) {
    if (v.id) {
      await db.productVariant.update({
        where: { id: v.id },
        data: { size: v.size, sku: v.sku, price: v.price, isActive: v.isActive },
      })
      await db.inventory.upsert({
        where: { variantId: v.id },
        create: { variantId: v.id, quantity: v.stock, reserved: 0 },
        update: { quantity: v.stock },
      })
    } else {
      const variant = await db.productVariant.create({
        data: {
          productId: id,
          size: v.size,
          sku: v.sku,
          price: v.price,
          isActive: v.isActive,
        },
      })
      await db.inventory.create({
        data: { variantId: variant.id, quantity: v.stock, reserved: 0 },
      })
    }
  }

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE_PRODUCT_FULL',
    entity: 'Product',
    entityId: id,
  })

  revalidatePath('/admin/products')
  revalidatePath(`/product/${product.slug}`)
  return { success: true, data: { id: product.id, slug: product.slug } }
}
