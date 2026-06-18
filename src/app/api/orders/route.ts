// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orderSchema } from '@/lib/validations'
import { checkRateLimit, getIP, createAuditLog } from '@/lib/security'
import { generateOrderNumber, calculateShipping } from '@/lib/utils'
import type { CartItem } from '@/types'

interface CreateOrderBody {
  addressId: string
  paymentMethod: 'STRIPE' | 'MERCADOPAGO' | 'SPEI'
  couponCode?: string
  notes?: string
  items: CartItem[]
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true } },
          variant: { select: { size: true, sku: true } },
        },
      },
      address: true,
      coupon: { select: { code: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: orders })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const rl = await checkRateLimit(request, `order:${session.user.id}`)
  if (!rl.success) return NextResponse.json({ error: 'Demasiados intentos' }, { status: 429 })

  let body: CreateOrderBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
  }

  // Verify address belongs to user
  const address = await db.address.findFirst({
    where: { id: parsed.data.addressId, userId: session.user.id },
  })
  if (!address) return NextResponse.json({ error: 'Dirección no válida' }, { status: 400 })

  // Verify inventory availability
  const variantIds = body.items.map((i) => i.variantId)
  const inventories = await db.inventory.findMany({
    where: { variantId: { in: variantIds } },
  })

  for (const item of body.items) {
    const inv = inventories.find((i) => i.variantId === item.variantId)
    const available = inv ? inv.quantity - inv.reserved : 0
    if (available < item.quantity) {
      return NextResponse.json(
        { error: `Stock insuficiente para talla ${item.size} de ${item.name}` },
        { status: 409 }
      )
    }
  }

  // Calculate totals
  const subtotal = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const { cost: shipping } = calculateShipping(subtotal)
  let discount = 0
  let couponId: string | null = null

  if (parsed.data.couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: parsed.data.couponCode.toUpperCase() } })
    if (coupon && coupon.isActive) {
      if (coupon.type === 'PERCENTAGE') discount = subtotal * (Number(coupon.value) / 100)
      else if (coupon.type === 'FIXED') discount = Math.min(Number(coupon.value), subtotal)
      else if (coupon.type === 'SHIPPING') discount = shipping
      couponId = coupon.id
    }
  }

  const total = Math.max(0, subtotal - discount + shipping)

  // Create order in transaction
  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        addressId: address.id,
        paymentMethod: parsed.data.paymentMethod,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        subtotal,
        discount,
        shipping,
        tax: 0,
        total,
        couponId,
        notes: parsed.data.notes,
        items: {
          create: body.items.map((item) => ({
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
    })

    // Reserve inventory
    await Promise.all(
      body.items.map((item) =>
        tx.inventory.update({
          where: { variantId: item.variantId },
          data: { reserved: { increment: item.quantity } },
        })
      )
    )

    // Record coupon usage
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      })
      await tx.couponUsage.create({
        data: { couponId, userId: session.user.id, orderId: created.id },
      })
    }

    return created
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'CREATE_ORDER',
    entity: 'Order',
    entityId: order.id,
    ip: getIP(request),
  })

  return NextResponse.json({ success: true, data: { orderId: order.id, orderNumber: order.orderNumber } }, { status: 201 })
}
