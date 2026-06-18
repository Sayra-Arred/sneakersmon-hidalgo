// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPaymentIntent } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({
  orderId: z.string().cuid(),
  amount: z.number().positive(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = schema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const order = await db.order.findUnique({
    where: { id: body.data.orderId, userId: session.user.id },
  })

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  if (order.paymentStatus === 'PAID') return NextResponse.json({ error: 'Ya pagado' }, { status: 400 })

  const paymentIntent = await createPaymentIntent(body.data.amount, 'mxn', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: session.user.id,
  })

  await db.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'PROCESSING', paymentIntentId: paymentIntent.id },
  })

  return NextResponse.json({ success: true, clientSecret: paymentIntent.client_secret })
}
