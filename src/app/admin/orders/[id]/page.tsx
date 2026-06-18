// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { formatPrice, formatDateTime, formatDate } from '@/lib/utils'
import { ArrowLeft, Package, User, MapPin, CreditCard, Clock, Truck } from 'lucide-react'
import type { OrderStatus } from '@/types'
import { OrderActions } from './order-actions'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const order = await db.order.findUnique({ where: { id }, select: { orderNumber: true } })
  return { title: order ? `Pedido ${order.orderNumber}` : 'Pedido no encontrado' }
}

async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
      address: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
            },
          },
          variant: { select: { size: true, sku: true } },
        },
      },
      coupon: { select: { code: true, type: true, value: true } },
      speiTransaction: true,
    },
  })
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  STRIPE: 'Tarjeta (Stripe)',
  MERCADOPAGO: 'MercadoPago',
  SPEI: 'Transferencia SPEI',
}

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const timeline = [
    { status: 'PENDING', label: 'Pedido recibido', date: order.createdAt },
    order.status !== 'PENDING' && order.status !== 'CANCELLED'
      ? { status: 'CONFIRMED', label: 'Confirmado', date: order.updatedAt }
      : null,
    ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
      ? { status: 'PROCESSING', label: 'En preparación', date: order.updatedAt }
      : null,
    ['SHIPPED', 'DELIVERED'].includes(order.status)
      ? { status: 'SHIPPED', label: 'Enviado', date: order.updatedAt }
      : null,
    order.status === 'DELIVERED'
      ? { status: 'DELIVERED', label: 'Entregado', date: order.deliveredAt ?? order.updatedAt }
      : null,
    order.status === 'CANCELLED'
      ? { status: 'CANCELLED', label: 'Cancelado', date: order.cancelledAt ?? order.updatedAt }
      : null,
    order.status === 'REFUNDED'
      ? { status: 'REFUNDED', label: 'Reembolsado', date: order.updatedAt }
      : null,
  ].filter(Boolean) as { status: OrderStatus; label: string; date: Date }[]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a pedidos
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-white font-mono">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status as OrderStatus} />
          </div>
          <p className="text-brand-muted text-sm mt-1">
            Creado el {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Status change + actions */}
        <OrderActions
          orderId={order.id}
          currentStatus={order.status as OrderStatus}
          trackingNumber={order.trackingNumber}
          allStatuses={ALL_STATUSES}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <section className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-accent" />
              <h2 className="font-display font-bold text-white">Artículos</h2>
            </div>
            <div className="divide-y divide-brand-border">
              {order.items.map((item) => {
                const image = item.product.images[0]
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-16 h-16 rounded-lg bg-brand-surface border border-brand-border overflow-hidden shrink-0 relative">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.altText ?? item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs">
                          Sin img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/products`}
                        className="text-sm font-medium text-white hover:text-brand-accent transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-xs text-brand-muted mt-0.5 space-x-2">
                        <span>Talla: <span className="text-white">{item.variant.size}</span></span>
                        <span>SKU: <span className="font-mono">{item.variant.sku}</span></span>
                      </div>
                      <div className="text-xs text-brand-muted mt-0.5">
                        Cant: {item.quantity} × {formatPrice(Number(item.price))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-semibold text-white">
                        {formatPrice(Number(item.subtotal))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order totals */}
            <div className="border-t border-brand-border px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm text-brand-muted">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatPrice(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-brand-success">
                  <span>Descuento{order.coupon ? ` (${order.coupon.code})` : ''}</span>
                  <span className="font-mono">-{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-brand-muted">
                <span>Envío</span>
                <span className="font-mono text-white">
                  {Number(order.shipping) === 0 ? 'GRATIS' : formatPrice(Number(order.shipping))}
                </span>
              </div>
              {Number(order.tax) > 0 && (
                <div className="flex justify-between text-sm text-brand-muted">
                  <span>Impuestos</span>
                  <span className="font-mono text-white">{formatPrice(Number(order.tax))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-white border-t border-brand-border pt-2 mt-2">
                <span>Total</span>
                <span className="font-mono text-brand-accent text-lg">{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-accent" />
              <h2 className="font-display font-bold text-white">Dirección de entrega</h2>
            </div>
            <div className="px-5 py-4 space-y-1 text-sm">
              <p className="font-semibold text-white">{order.address.name}</p>
              <p className="text-brand-muted">{order.address.street}</p>
              <p className="text-brand-muted">Col. {order.address.colonia}</p>
              <p className="text-brand-muted">
                {order.address.city}, {order.address.state} C.P. {order.address.postalCode}
              </p>
              <p className="text-brand-muted">Tel: {order.address.phone}</p>
              {order.address.references && (
                <p className="text-brand-muted italic">Ref: {order.address.references}</p>
              )}
            </div>
          </section>

          {/* Shipping */}
          {order.trackingNumber && (
            <section className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-accent" />
                <h2 className="font-display font-bold text-white">Envío</h2>
              </div>
              <div className="px-5 py-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Número de rastreo</span>
                  <span className="font-mono font-semibold text-white">{order.trackingNumber}</span>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Entrega estimada</span>
                    <span className="text-white">{formatDate(order.estimatedDelivery)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Notes */}
          {order.notes && (
            <section className="bg-brand-elevated border border-brand-border rounded-xl px-5 py-4">
              <h2 className="font-display font-bold text-white text-sm mb-2">Notas del pedido</h2>
              <p className="text-sm text-brand-muted">{order.notes}</p>
            </section>
          )}

          {/* Cancel reason */}
          {order.status === 'CANCELLED' && order.cancelReason && (
            <section className="bg-brand-error/5 border border-brand-error/20 rounded-xl px-5 py-4">
              <h2 className="font-display font-bold text-brand-error text-sm mb-2">Razón de cancelación</h2>
              <p className="text-sm text-brand-muted">{order.cancelReason}</p>
              {order.cancelledAt && (
                <p className="text-xs text-brand-muted mt-1">{formatDateTime(order.cancelledAt)}</p>
              )}
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer */}
          <section className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
              <User className="w-4 h-4 text-brand-accent" />
              <h2 className="font-display font-bold text-white">Cliente</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-white">{order.user.name ?? '—'}</p>
                <p className="text-brand-muted">{order.user.email}</p>
                {order.user.phone && <p className="text-brand-muted">{order.user.phone}</p>}
              </div>
              <div className="border-t border-brand-border pt-3">
                <p className="text-xs text-brand-muted">Cliente desde</p>
                <p className="text-white">{formatDate(order.user.createdAt)}</p>
              </div>
              <Link
                href={`/admin/users?q=${encodeURIComponent(order.user.email)}`}
                className="block text-xs text-brand-accent hover:underline"
              >
                Ver pedidos del cliente →
              </Link>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-accent" />
              <h2 className="font-display font-bold text-white">Pago</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">Método</span>
                <span className="text-white font-medium">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Estado de pago</span>
                <span className={`font-semibold ${
                  order.paymentStatus === 'PAID' ? 'text-brand-success' :
                  order.paymentStatus === 'FAILED' ? 'text-brand-error' :
                  order.paymentStatus === 'REFUNDED' ? 'text-orange-400' :
                  'text-yellow-400'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentIntentId && (
                <div>
                  <span className="text-brand-muted block mb-0.5">ID de pago</span>
                  <span className="font-mono text-xs text-white break-all">{order.paymentIntentId}</span>
                </div>
              )}

              {/* SPEI details */}
              {order.paymentMethod === 'SPEI' && order.speiTransaction && (
                <div className="border-t border-brand-border pt-3 space-y-2">
                  <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Datos SPEI</p>
                  <div>
                    <span className="text-brand-muted text-xs">CLABE</span>
                    <p className="font-mono text-white text-sm tracking-widest">{order.speiTransaction.clabe}</p>
                  </div>
                  <div>
                    <span className="text-brand-muted text-xs">Referencia</span>
                    <p className="font-mono text-white text-sm">{order.speiTransaction.reference}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted text-xs">Banco</span>
                    <span className="text-white text-xs">{order.speiTransaction.bank ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted text-xs">Vence</span>
                    <span className="text-white text-xs font-mono">
                      {formatDateTime(order.speiTransaction.createdAt)}
                    </span>
                  </div>
                  {order.speiTransaction.confirmedAt && (
                    <div className="flex justify-between">
                      <span className="text-brand-muted text-xs">Confirmado</span>
                      <span className="text-brand-success text-xs">
                        {formatDateTime(order.speiTransaction.confirmedAt)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Timeline */}
          <section className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-accent" />
              <h2 className="font-display font-bold text-white">Historial</h2>
            </div>
            <div className="px-5 py-4">
              <ol className="space-y-4">
                {timeline.map((event, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        i === timeline.length - 1 ? 'bg-brand-accent' : 'bg-brand-border'
                      }`} />
                      {i < timeline.length - 1 && (
                        <div className="w-px flex-1 bg-brand-border mt-1 min-h-[24px]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{event.label}</p>
                      <p className="text-xs text-brand-muted">{formatDateTime(event.date)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
