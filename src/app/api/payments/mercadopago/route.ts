// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPreference } from '@/lib/mercadopago'
import { z } from 'zod'
import { absoluteUrl } from '@/lib/utils'

const schema = z.object({ orderId: z.string().cuid() })

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = schema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const order = await db.order.findUnique({
    where: { id: body.data.orderId, userId: session.user.id },
    include: {
      items: { include: { product: { select: { name: true } }, variant: { select: { size: true } } } },
      user: { select: { name: true, email: true, phone: true } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  if (order.paymentStatus === 'PAID') return NextResponse.json({ error: 'Ya pagado' }, { status: 400 })

  const preference = await createPreference({
    items: order.items.map((item) => ({
      id: item.variantId,
      title: `${item.product.name} T.${item.variant.size}`,
      unit_price: Number(item.price),
      quantity: item.quantity,
    })),
    payer: {
      name: order.user.name ?? session.user.name ?? 'Cliente',
      email: order.user.email ?? session.user.email,
      ...(order.user.phone && {
        phone: { area_code: '52', number: order.user.phone },
      }),
    },
    orderId: order.id,
    successUrl: absoluteUrl(`/orders/${order.id}?payment=success`),
    failureUrl: absoluteUrl(`/checkout?error=payment_failed`),
    pendingUrl: absoluteUrl(`/orders/${order.id}?payment=pending`),
    notificationUrl: absoluteUrl('/api/webhooks/mercadopago'),
  })

  await db.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'PROCESSING', paymentIntentId: preference.id ?? null },
  })

  return NextResponse.json({
    success: true,
    data: {
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    },
  })
}
