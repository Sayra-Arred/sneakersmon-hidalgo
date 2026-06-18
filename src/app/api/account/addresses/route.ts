// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const addressSchema = z.object({
  name: z.string().min(2).max(100),
  street: z.string().min(5).max(200),
  colonia: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  country: z.string().default('México'),
  postalCode: z.string().min(5).max(10),
  phone: z.string().min(10).max(20),
  references: z.string().max(300).optional(),
  isDefault: z.boolean().optional().default(false),
})

const deleteSchema = z.object({ id: z.string().cuid() })

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ success: true, data: addresses })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = addressSchema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos', details: body.error.flatten() }, { status: 400 })

  if (body.data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    })
  }

  const address = await db.address.create({
    data: { ...body.data, userId: session.user.id },
  })

  return NextResponse.json({ success: true, data: address }, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id, ...rest } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const body = addressSchema.partial().safeParse(rest)
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const existing = await db.address.findUnique({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 })

  if (body.data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id, id: { not: id } },
      data: { isDefault: false },
    })
  }

  const address = await db.address.update({
    where: { id },
    data: body.data,
  })

  return NextResponse.json({ success: true, data: address })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = deleteSchema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const existing = await db.address.findUnique({ where: { id: body.data.id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 })

  await db.address.delete({ where: { id: body.data.id } })

  return NextResponse.json({ success: true })
}
