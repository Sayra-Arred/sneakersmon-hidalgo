// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const addSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  notifyRestock: z.boolean().optional().default(true),
  notifyPrice: z.boolean().optional().default(false),
})

const removeSchema = z.object({ productId: z.string().cuid() })

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const wishlist = await db.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          brand: { select: { name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
      variant: { select: { size: true, sku: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: wishlist })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = addSchema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const existing = await db.wishlist.findUnique({
    where: { userId_productId: { userId: session.user.id, productId: body.data.productId } },
  })
  if (existing) return NextResponse.json({ success: true, data: existing, message: 'Ya en lista' })

  const item = await db.wishlist.create({
    data: {
      userId: session.user.id,
      productId: body.data.productId,
      variantId: body.data.variantId,
      notifyRestock: body.data.notifyRestock,
      notifyPrice: body.data.notifyPrice,
    },
  })

  return NextResponse.json({ success: true, data: item }, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = removeSchema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  await db.wishlist.deleteMany({
    where: { userId: session.user.id, productId: body.data.productId },
  })

  return NextResponse.json({ success: true })
}
