// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/security'
import type { ActionResult, OrderStatus } from '@/types'

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { success: false, error: 'No autorizado' }

  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    include: { items: true },
  })

  if (!order) return { success: false, error: 'Pedido no encontrado o no se puede cancelar' }

  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: 'Cancelado por el cliente' },
    }),
    ...order.items.map((item) =>
      db.inventory.update({
        where: { variantId: item.variantId },
        data: { reserved: { decrement: item.quantity } },
      })
    ),
  ])

  await createAuditLog({
    userId: session.user.id,
    action: 'CANCEL_ORDER',
    entity: 'Order',
    entityId: orderId,
  })

  revalidatePath('/orders')
  return { success: true }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<ActionResult> {
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'No autorizado' }
  }

  const updateData: Record<string, unknown> = { status }
  if (trackingNumber) updateData.trackingNumber = trackingNumber
  if (status === 'DELIVERED') updateData.deliveredAt = new Date()
  if (status === 'CANCELLED') updateData.cancelledAt = new Date()

  await db.order.update({ where: { id: orderId }, data: updateData })

  await createAuditLog({
    userId: session.user.id,
    action: 'UPDATE_ORDER_STATUS',
    entity: 'Order',
    entityId: orderId,
    changes: updateData,
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}
