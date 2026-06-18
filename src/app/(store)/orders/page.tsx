'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ShoppingBag, ArrowRight, Clock, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderSummary, OrderStatus } from '@/types/order'

export const dynamic = 'force-dynamic'
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'accent' | 'gold' | 'success' | 'error' | 'outline'> = {
  PENDING: 'outline',
  CONFIRMED: 'accent',
  PROCESSING: 'accent',
  SHIPPED: 'gold',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUNDED: 'default',
}

export default function OrdersPage() {
  const router = useRouter()
  const { status } = useSession()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/orders')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.data ?? [])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [status])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-brand-black py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-40 bg-brand-elevated rounded-xl animate-pulse mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-brand-elevated rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-brand-accent" />
            <h1 className="font-display font-black text-3xl">Mis pedidos</h1>
          </div>
          <p className="text-brand-muted">
            {orders.length > 0
              ? `Tienes ${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'} en total`
              : 'Aún no has realizado ningún pedido'}
          </p>
        </div>

        {orders.length === 0 ? (
          /* Empty state */
          <div className="bg-brand-surface border border-brand-border rounded-2xl flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 rounded-full bg-brand-elevated flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-brand-muted" />
            </div>
            <h2 className="font-bold text-xl mb-2">No tienes pedidos aún</h2>
            <p className="text-brand-muted text-center max-w-sm">
              Explora nuestro catálogo de sneakers premium y realiza tu primer pedido.
            </p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex items-center gap-2 bg-brand-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#e04d18] transition-colors"
            >
              Explorar catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Orders list */
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-brand-border text-brand-muted text-xs font-semibold uppercase tracking-wider">
              <div className="col-span-4">Pedido</div>
              <div className="col-span-2">Fecha</div>
              <div className="col-span-2">Artículos</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-2">Estado</div>
            </div>

            <div className="divide-y divide-brand-border">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-brand-elevated transition-colors items-center"
                >
                  {/* Order number + image */}
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {order.primaryImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={order.primaryImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-brand-muted" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-sm">{order.orderNumber}</p>
                      <div className="flex items-center gap-1 mt-0.5 sm:hidden">
                        <Clock className="w-3 h-3 text-brand-muted" />
                        <span className="text-brand-muted text-xs">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:flex sm:col-span-2 items-center gap-1 text-brand-muted text-sm">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{formatDate(order.createdAt, { dateStyle: 'short' })}</span>
                  </div>

                  {/* Item count */}
                  <div className="sm:col-span-2">
                    <span className="text-sm text-brand-muted sm:text-white">
                      {order.itemCount} {order.itemCount === 1 ? 'artículo' : 'artículos'}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-sm">{formatPrice(order.total)}</span>
                  </div>

                  {/* Status + arrow */}
                  <div className="sm:col-span-2 flex items-center justify-between">
                    <Badge variant={STATUS_VARIANT[order.status]}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-brand-muted hidden sm:block" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
