// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/security'
import { generateSlug } from '@/lib/utils'
import type { ActionResult } from '@/types'

function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

export async function createProduct(data: unknown): Promise<ActionResult> {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) return { success: false, error: 'No autorizado' }

  const parsed = productSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const slug = parsed.data.slug || generateSlug(parsed.data.name)

  const product = await db.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      shortDescription: parsed.data.shortDescription,
      brandId: parsed.data.brandId,
      categoryId: parsed.data.categoryId,
      gender: parsed.data.gender,
      colorway: parsed.data.colorway,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice,
      cost: parsed.data.cost,
      status: parsed.data.status,
      isFeatured: parsed.data.isFeatured,
      isLimitedEdition: parsed.data.isLimitedEdition,
      isBestSeller: parsed.data.isBestSeller,
      isNewArrival: parsed.data.isNewArrival,
      tags: parsed.data.tags,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
    },
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'CREATE_PRODUCT',
    entity: 'Product',
    entityId: product.id,
  })

  revalidatePath('/admin/products')
  revalidatePath('/catalog')
  return { success: true, data: product }
}

export async function updateProduct(id: string, data: unknown): Promise<ActionResult> {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) return { success: false, error: 'No autorizado' }

  const parsed = productSchema.partial().safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const product = await db.product.update({ where: { id }, data: parsed.data })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE_PRODUCT',
    entity: 'Product',
    entityId: id,
    changes: parsed.data,
  })

  revalidatePath('/admin/products')
  revalidatePath(`/product/${product.slug}`)
  return { success: true, data: product }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) return { success: false, error: 'No autorizado' }

  await db.product.update({ where: { id }, data: { status: 'ARCHIVED' } })

  await createAuditLog({
    userId: session.user.id,
    action: 'ARCHIVE_PRODUCT',
    entity: 'Product',
    entityId: id,
  })

  revalidatePath('/admin/products')
  return { success: true }
}

export async function updateInventory(variantId: string, quantity: number): Promise<ActionResult> {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) return { success: false, error: 'No autorizado' }

  await db.inventory.upsert({
    where: { variantId },
    create: { variantId, quantity, reserved: 0 },
    update: { quantity },
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE_INVENTORY',
    entity: 'Inventory',
    entityId: variantId,
    changes: { quantity },
  })

  revalidatePath('/admin/inventory')
  return { success: true }
}
