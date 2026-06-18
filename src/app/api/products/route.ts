// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { searchSchema, productSchema } from '@/lib/validations'
import { checkRateLimit, createAuditLog, getIP } from '@/lib/security'
import { generateSlug } from '@/lib/utils'

export async function GET(request: Request) {
  const rl = await checkRateLimit(request)
  if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { searchParams } = new URL(request.url)
  const params = searchSchema.safeParse(Object.fromEntries(searchParams))
  if (!params.success) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })

  const { q, category, brand, minPrice, maxPrice, size, gender, sort, page, limit } = params.data
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    status: 'ACTIVE',
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { name: { contains: q, mode: 'insensitive' } } },
        { tags: { has: q } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(brand && { brand: { slug: brand } }),
    ...(gender && { gender }),
    ...(minPrice !== undefined && maxPrice !== undefined
      ? { price: { gte: minPrice, lte: maxPrice } }
      : minPrice !== undefined
      ? { price: { gte: minPrice } }
      : maxPrice !== undefined
      ? { price: { lte: maxPrice } }
      : {}),
    ...(size && { variants: { some: { size, isActive: true } } }),
  }

  const orderBy = (() => {
    switch (sort) {
      case 'price_asc': return { price: 'asc' as const }
      case 'price_desc': return { price: 'desc' as const }
      case 'newest': return { createdAt: 'desc' as const }
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
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        images: { where: { isPrimary: true }, take: 1 },
        variants: { include: { inventory: true }, where: { isActive: true } },
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: products,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = productSchema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 })

  const data = body.data
  const slug = data.slug || generateSlug(data.name)

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

  await createAuditLog({
    userId: session.user.id,
    action: 'CREATE_PRODUCT',
    entity: 'Product',
    entityId: product.id,
    ip: getIP(request),
  })

  return NextResponse.json({ success: true, data: product }, { status: 201 })
}
