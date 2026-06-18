'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle,
  MapPin, CreditCard, Copy, Check,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from '@/types/order'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'
interface SpeiInfo {
  clabe: string
  reference: string
  amount: number
  bank: string
  expiresAt: string
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  STRIPE: 'Tarjeta de crédito/débito',
  MERCADOPAGO: 'Mercado Pago',
  SPEI: 'Transferencia SPEI',
}

const STATUS_STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const STEP_ICONS: Record<OrderStatus, typeof Clock> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
  REFUNDED: XCircle,
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          toast.success(`${label} copiado`)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          toast.error('No se pudo copiar')
        }
      }}
      className="p-1.5 rounded-lg hover:bg-brand-border text-brand-muted hover:text-white transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-brand-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { status } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [speiInfo, setSpeiInfo] = useState<SpeiInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/orders/' + id)
    }
  }, [status, router, id])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch(`/api/orders/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then((data) => {
        if (data?.success) setOrder(data.data)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [id, status])

  // Load SPEI details if needed
  useEffect(() => {
    if (!order || order.paymentMethod !== 'SPEI' || order.paymentStatus === 'PAID') return
    fetch('/api/payments/spei', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSpeiInfo(data.data)
      })
      .catch(() => {})
  }, [order])

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-black py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-brand-elevated rounded-xl animate-pulse mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-brand-elevated rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center py-10">
        <div className="text-center">
          <Package className="w-16 h-16 text-brand-muted mx-auto mb-4" />
          <h1 className="font-display font-black text-2xl mb-2">Pedido no encontrado</h1>
          <p className="text-brand-muted mb-6">El pedido que buscas no existe o no tienes acceso.</p>
          <Link href="/orders" className="text-brand-accent hover:underline font-semibold">
            ← Volver a mis pedidos
          </Link>
        </div>
      </div>
    )
  }

  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'
  const currentStepIdx = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-brand-black py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back + header */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-brand-muted hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Mis pedidos
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-display font-black text-2xl">{order.orderNumber}</h1>
              <p className="text-brand-muted text-sm mt-0.5">
                Realizado el {formatDateTime(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={
                order.status === 'DELIVERED' ? 'success'
                  : order.status === 'CANCELLED' || order.status === 'REFUNDED' ? 'error'
                  : order.status === 'SHIPPED' ? 'gold'
                  : 'accent'
              }>
                {STATUS_LABELS[order.status]}
              </Badge>
              <Badge variant={
                order.paymentStatus === 'PAID' ? 'success'
                  : order.paymentStatus === 'FAILED' ? 'error'
                  : 'outline'
              }>
                {PAYMENT_STATUS_LABELS[order.paymentStatus]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Status timeline */}
        {!isCancelled ? (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <h2 className="font-bold mb-6">Estado del pedido</h2>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-brand-border" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-brand-accent transition-all duration-500"
                style={{ width: currentStepIdx > 0 ? `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
              />

              {/* Steps */}
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = STEP_ICONS[step]
                  const isDone = idx <= currentStepIdx
                  const isCurrent = idx === currentStepIdx
                  return (
                    <div key={step} className="flex flex-col items-center gap-2 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 relative ${
                        isDone
                          ? 'bg-brand-accent border-brand-accent text-white'
                          : 'bg-brand-elevated border-brand-border text-brand-muted'
                      } ${isCurrent ? 'ring-2 ring-brand-accent ring-offset-2 ring-offset-brand-surface' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs text-center font-medium ${isDone ? 'text-white' : 'text-brand-muted'}`}>
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {order.trackingNumber && (
              <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between">
                <div>
                  <p className="text-brand-muted text-xs uppercase tracking-wider mb-0.5">Número de rastreo</p>
                  <p className="font-mono font-semibold">{order.trackingNumber}</p>
                </div>
                {order.estimatedDelivery && (
                  <div className="text-right">
                    <p className="text-brand-muted text-xs uppercase tracking-wider mb-0.5">Entrega estimada</p>
                    <p className="font-semibold text-sm">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-brand-error/10 border border-brand-error/20 rounded-2xl p-5 flex items-start gap-4">
            <XCircle className="w-6 h-6 text-brand-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-error">Pedido {order.status === 'CANCELLED' ? 'cancelado' : 'reembolsado'}</p>
              {order.cancelReason && (
                <p className="text-brand-muted text-sm mt-1">Motivo: {order.cancelReason}</p>
              )}
              {order.cancelledAt && (
                <p className="text-brand-muted text-sm">{formatDateTime(order.cancelledAt)}</p>
              )}
            </div>
          </div>
        )}

        {/* SPEI payment details */}
        {order.paymentMethod === 'SPEI' && order.paymentStatus !== 'PAID' && speiInfo && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-brand-accent" />
              <h2 className="font-bold">Datos para transferencia SPEI</h2>
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />
                <span className="text-xs text-brand-muted">Monitoreando</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Banco', value: speiInfo.bank },
                { label: 'CLABE', value: speiInfo.clabe },
                { label: 'Referencia', value: speiInfo.reference },
                { label: 'Monto exacto', value: formatPrice(speiInfo.amount) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between bg-brand-elevated rounded-xl px-4 py-3">
                  <div>
                    <p className="text-brand-muted text-xs uppercase tracking-wider">{label}</p>
                    <p className="font-mono font-semibold text-sm mt-0.5">{value}</p>
                  </div>
                  <CopyButton value={label === 'Monto exacto' ? speiInfo.amount.toFixed(2) : value} label={label} />
                </div>
              ))}
            </div>
            <p className="text-brand-muted text-xs mt-4">
              Expira: {formatDateTime(speiInfo.expiresAt)} · La transferencia puede tardar hasta 1 hora.
            </p>
          </div>
        )}

        {/* Items */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-border">
            <h2 className="font-bold">Artículos ({order.items.length})</h2>
          </div>
          <div className="divide-y divide-brand-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-16 h-16 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.product?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-brand-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.product?.name}</p>
                  <p className="text-brand-muted text-xs mt-0.5">
                    Talla {item.variant?.size} · SKU: {item.variant?.sku}
                  </p>
                  <p className="text-brand-muted text-xs">Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm">{formatPrice(item.subtotal)}</p>
                  <p className="text-brand-muted text-xs">{formatPrice(item.price)} c/u</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address + Payment | Total breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Address */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-brand-accent" />
              <h2 className="font-bold text-sm">Dirección de entrega</h2>
            </div>
            <div className="text-sm space-y-0.5 text-brand-muted">
              <p className="font-semibold text-white">{order.address?.name}</p>
              <p>{order.address?.street}</p>
              <p>{order.address?.colonia}</p>
              <p>{order.address?.city}, {order.address?.state} {order.address?.postalCode}</p>
              <p>{order.address?.phone}</p>
              {order.address?.references && (
                <p className="text-brand-muted text-xs mt-1">Ref: {order.address.references}</p>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-brand-accent" />
              <h2 className="font-bold text-sm">Pago</h2>
            </div>
            <div className="text-sm space-y-1 text-brand-muted">
              <p className="text-white font-semibold">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
              {order.coupon && (
                <p>Cupón: <span className="font-mono text-brand-success">{order.coupon.code}</span></p>
              )}
            </div>

            {/* Cost breakdown */}
            <div className="mt-4 space-y-2 pt-4 border-t border-brand-border">
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-brand-success">Descuento</span>
                  <span className="text-brand-success">−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-brand-muted">Envío</span>
                <span>{order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">IVA</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-brand-border">
                <span>Total</span>
                <span className="text-brand-accent">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <h2 className="font-bold text-sm mb-2">Notas del pedido</h2>
            <p className="text-brand-muted text-sm">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
