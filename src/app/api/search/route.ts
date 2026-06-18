// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { searchSchema } from '@/lib/validations'
import { checkRateLimit } from '@/lib/security'

export async function GET(request: Request) {
  const rl = await checkRateLimit(request)
  if (!rl.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const { searchParams } = new URL(request.url)
  const params = searchSchema.safeParse(Object.fromEntries(searchParams))

  if (!params.success) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const { q, category, brand, minPrice, maxPrice, size, gender, sort, page, limit } = params.data
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    status: 'ACTIVE',
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
        { brand: { name: { contains: q, mode: 'insensitive' } } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(brand && { brand: { slug: brand } }),
    ...(gender && { gender }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) } }
      : {}),
    ...(size && { variants: { some: { size, isActive: true, inventory: { quantity: { gt: 0 } } } } }),
  }

  const orderBy = (() => {
    switch (sort) {
      case 'price_asc': return { price: 'asc' as const }
      case 'price_desc': return { price: 'desc' as const }
      case 'newest': return { createdAt: 'desc' as const }
      case 'popular': return { sortOrder: 'asc' as const }
      default: return { sortOrder: 'asc' as const }
    }
  })()

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        brand: { select: { id: true, name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
        variants: {
          where: { isActive: true },
          include: { inventory: { select: { quantity: true, reserved: true } } },
          select: { id: true, size: true, sku: true, price: true, isActive: true, inventory: true },
        },
      },
    }),
  ])

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    brand: p.brand,
    isFeatured: p.isFeatured,
    isLimitedEdition: p.isLimitedEdition,
    isBestSeller: p.isBestSeller,
    colorway: p.colorway,
    primaryImage: p.images[0]?.url ?? null,
    availableSizes: p.variants
      .filter((v) => v.inventory && v.inventory.quantity - v.inventory.reserved > 0)
      .map((v) => v.size),
    totalStock: p.variants.reduce(
      (sum, v) => sum + (v.inventory ? Math.max(0, v.inventory.quantity - v.inventory.reserved) : 0),
      0
    ),
  }))

  return NextResponse.json({
    success: true,
    data,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  })
}
