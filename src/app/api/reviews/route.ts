// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviewSchema } from '@/lib/validations'
import { checkRateLimit, getIP } from '@/lib/security'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  const where = {
    isApproved: true,
    ...(productId ? { productId } : {}),
  }

  const reviews = await db.review.findMany({
    where,
    include: {
      user: { select: { name: true, image: true } },
      images: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ success: true, data: reviews })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }

  const rl = await checkRateLimit(request, session.user.id)
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Demasiadas solicitudes' }, { status: 429 })
  }

  const body = reviewSchema.safeParse(await request.json())
  if (!body.success) {
    return NextResponse.json({ success: false, error: body.error.issues[0].message }, { status: 400 })
  }

  const hasOrdered = await db.orderItem.findFirst({
    where: {
      productId: body.data.productId,
      order: { userId: session.user.id, paymentStatus: 'PAID' },
    },
  })

  const review = await db.review.create({
    data: {
      userId: session.user.id,
      productId: body.data.productId,
      rating: body.data.rating,
      title: body.data.title,
      body: body.data.body,
      isVerified: !!hasOrdered,
      isApproved: false,
    },
  })

  return NextResponse.json({ success: true, data: review }, { status: 201 })
}
