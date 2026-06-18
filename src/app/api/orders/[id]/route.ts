// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createAuditLog, getIP } from '@/lib/security'

const updateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  trackingNumber: z.string().max(100).optional(),
  estimatedDelivery: z.string().datetime().optional(),
  cancelReason: z.string().max(500).optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'

  const order = await db.order.findUnique({
    where: {
      id,
      ...(!isAdmin && { userId: session.user.id }),
    },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } } },
          variant: { select: { size: true, sku: true } },
        },
      },
      address: true,
      coupon: { select: { code: true, type: true, value: true } },
      user: { select: { name: true, email: true, phone: true } },
      speiTransaction: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, data: order })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = updateSchema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 })

  const updateData: Record<string, unknown> = {}
  if (body.data.status) updateData.status = body.data.status
  if (body.data.trackingNumber) updateData.trackingNumber = body.data.trackingNumber
  if (body.data.estimatedDelivery) updateData.estimatedDelivery = new Date(body.data.estimatedDelivery)
  if (body.data.cancelReason) updateData.cancelReason = body.data.cancelReason
  if (body.data.status === 'DELIVERED') updateData.deliveredAt = new Date()
  if (body.data.status === 'CANCELLED') updateData.cancelledAt = new Date()

  const order = await db.order.update({
    where: { id },
    data: updateData,
    include: { user: { select: { email: true, name: true } } },
  })

  await createAuditLog({
    userId: session.user.id,
    action: `UPDATE_ORDER_STATUS`,
    entity: 'Order',
    entityId: order.id,
    changes: updateData,
    ip: getIP(request),
  })

  return NextResponse.json({ success: true, data: order })
}
