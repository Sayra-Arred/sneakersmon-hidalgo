// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  dropId: z.string().cuid(),
  phone: z.string().max(20).optional(),
  notifyWhatsapp: z.boolean().optional().default(false),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = schema.safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const drop = await db.drop.findUnique({ where: { id: body.data.dropId } })
  if (!drop) return NextResponse.json({ error: 'Drop no encontrado' }, { status: 404 })
  if (drop.status === 'ENDED') return NextResponse.json({ error: 'Este drop ha finalizado' }, { status: 400 })

  const existing = await db.dropRegistration.findUnique({
    where: { dropId_userId: { dropId: body.data.dropId, userId: session.user.id } },
  })
  if (existing) return NextResponse.json({ success: true, data: existing, message: 'Ya registrado' })

  const registration = await db.dropRegistration.create({
    data: {
      dropId: body.data.dropId,
      userId: session.user.id,
      email: session.user.email!,
      phone: body.data.phone,
      notifyWhatsapp: body.data.notifyWhatsapp ?? false,
    },
  })

  return NextResponse.json({ success: true, data: registration }, { status: 201 })
}
