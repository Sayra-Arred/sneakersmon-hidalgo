// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { productSchema } from '@/lib/validations'
import { createAuditLog, getIP } from '@/lib/security'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: 'asc' } },
      variants: {
        include: { inventory: true },
        where: { isActive: true },
        orderBy: { size: 'asc' },
      },
    },
  })

  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, data: product })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = productSchema.partial().safeParse(await request.json())
  if (!body.success) return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 })

  const product = await db.product.update({
    where: { id },
    data: body.data,
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE_PRODUCT',
    entity: 'Product',
    entityId: product.id,
    changes: body.data,
    ip: getIP(request),
  })

  return NextResponse.json({ success: true, data: product })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  await db.product.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  })

  await createAuditLog({
    userId: session.user.id,
    action: 'ARCHIVE_PRODUCT',
    entity: 'Product',
    entityId: id,
    ip: getIP(request),
  })

  return NextResponse.json({ success: true })
}
