// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { generateSpeiReference } from '@/lib/utils'

const schema = z.object({ orderId: z.string().cuid() })

function generateCLABE(): string {
  const prefix = process.env.SPEI_CLABE_PREFIX ?? '646180'
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('')
  return prefix + digits
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = schema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const order = await db.order.findUnique({
    where: { id: body.data.orderId, userId: session.user.id },
    include: { speiTransaction: true },
  })

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  if (order.paymentStatus === 'PAID') return NextResponse.json({ error: 'Ya pagado' }, { status: 400 })

  if (order.speiTransaction) {
    return NextResponse.json({
      success: true,
      data: {
        clabe: order.speiTransaction.clabe,
        reference: order.speiTransaction.reference,
        amount: Number(order.speiTransaction.amount),
        bank: 'STP (Sistema de Transferencias y Pagos)',
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      },
    })
  }

  const speiTx = await db.speiTransaction.create({
    data: {
      orderId: order.id,
      clabe: generateCLABE(),
      reference: generateSpeiReference(),
      amount: order.total,
      bank: 'STP (Sistema de Transferencias y Pagos)',
      status: 'PENDING',
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      clabe: speiTx.clabe,
      reference: speiTx.reference,
      amount: Number(speiTx.amount),
      bank: speiTx.bank,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    },
  })
}
