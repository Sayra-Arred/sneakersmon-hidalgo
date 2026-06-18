// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })

  const order = await db.order.findUnique({
    where: { id: orderId, userId: session.user.id },
    select: { paymentStatus: true, status: true },
  })

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  return NextResponse.json({ success: true, data: { paymentStatus: order.paymentStatus, status: order.status } })
}
