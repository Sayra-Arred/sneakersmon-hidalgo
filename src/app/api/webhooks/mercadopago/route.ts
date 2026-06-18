// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPayment, verifyWebhookSignature } from '@/lib/mercadopago'
import { sendEmail, orderConfirmationEmail } from '@/lib/email'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-signature') ?? ''
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? ''

  if (secret && !verifyWebhookSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let notification: { type?: string; data?: { id?: string } }
  try {
    notification = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (notification.type === 'payment' && notification.data?.id) {
    const payment = await getPayment(notification.data.id)
    const orderId = payment.external_reference

    if (!orderId) return NextResponse.json({ received: true })

    if (payment.status === 'approved') {
      const order = await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
        include: {
          items: { include: { product: true, variant: true } },
          user: { select: { email: true } },
        },
      })

      await Promise.all(
        order.items.map((item) =>
          db.inventory.update({
            where: { variantId: item.variantId },
            data: {
              quantity: { decrement: item.quantity },
              reserved: { decrement: item.quantity },
            },
          })
        )
      )

      if (order.user.email) {
        await sendEmail({
          to: order.user.email,
          subject: `Pedido confirmado: ${order.orderNumber}`,
          html: orderConfirmationEmail({
            orderNumber: order.orderNumber,
            total: Number(order.total),
            items: order.items.map((i) => ({
              name: i.product.name,
              size: i.variant.size,
              quantity: i.quantity,
              price: Number(i.price),
            })),
          }),
        })
      }
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
