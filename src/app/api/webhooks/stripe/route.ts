// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { sendEmail, orderConfirmationEmail } from '@/lib/email'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object
      const orderId = pi.metadata?.orderId
      if (!orderId) break

      const order = await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
        include: {
          items: { include: { product: true, variant: true } },
          user: { select: { email: true, name: true } },
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
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object
      const orderId = pi.metadata?.orderId
      if (!orderId) break

      await db.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
      })

      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

      if (order) {
        await Promise.all(
          order.items.map((item) =>
            db.inventory.update({
              where: { variantId: item.variantId },
              data: { reserved: { decrement: item.quantity } },
            })
          )
        )
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object
      const pi = charge.payment_intent as string
      if (pi) {
        await db.order.updateMany({
          where: { paymentIntentId: pi },
          data: { paymentStatus: 'REFUNDED', status: 'REFUNDED' },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
