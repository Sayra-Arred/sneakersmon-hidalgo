// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/security'

const schema = z.object({
  code: z.string().min(1).max(30),
  subtotal: z.number().positive(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ valid: false, message: 'Inicia sesión para usar cupones' }, { status: 401 })

  const rl = await checkRateLimit(request, `coupon:${session.user.id}`)
  if (!rl.success) return NextResponse.json({ valid: false, message: 'Demasiados intentos' }, { status: 429 })

  const body = schema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ valid: false, message: 'Datos inválidos' }, { status: 400 })

  const { code, subtotal } = body.data
  const now = new Date()

  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } })

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ valid: false, message: 'Cupón no válido o inactivo' })
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return NextResponse.json({ valid: false, message: 'El cupón aún no es válido' })
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return NextResponse.json({ valid: false, message: 'El cupón ha expirado' })
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, message: 'El cupón ha alcanzado su límite de usos' })
  }

  if (coupon.minOrder !== null && subtotal < Number(coupon.minOrder)) {
    return NextResponse.json({
      valid: false,
      message: `El pedido mínimo para este cupón es $${Number(coupon.minOrder).toLocaleString('es-MX')} MXN`,
    })
  }

  const userUsage = await db.couponUsage.findFirst({
    where: { couponId: coupon.id, userId: session.user.id },
  })
  if (userUsage) {
    return NextResponse.json({ valid: false, message: 'Ya usaste este cupón anteriormente' })
  }

  let discount = 0
  if (coupon.type === 'PERCENTAGE') discount = subtotal * (Number(coupon.value) / 100)
  else if (coupon.type === 'FIXED') discount = Math.min(Number(coupon.value), subtotal)
  else if (coupon.type === 'SHIPPING') discount = 0

  return NextResponse.json({
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    discount: Math.round(discount * 100) / 100,
    message: `Cupón aplicado: ${coupon.type === 'PERCENTAGE' ? Number(coupon.value) + '% de descuento' : '$' + Number(coupon.value).toLocaleString('es-MX') + ' de descuento'}`,
  })
}
