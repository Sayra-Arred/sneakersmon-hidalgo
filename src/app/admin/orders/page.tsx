// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ShoppingCart, Clock, Loader2, DollarSign, ExternalLink } from 'lucide-react'
import type { OrderStatus, PaymentMethod } from '@/types'

export const metadata: Metadata = { title: 'Pedidos' }
export const dynamic = 'force-dynamic'

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
const PAYMENT_METHODS: PaymentMethod[] = ['STRIPE', 'MERCADOPAGO', 'SPEI']

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  STRIPE: 'Stripe',
  MERCADOPAGO: 'MercadoPago',
  SPEI: 'SPEI',
}

const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  STRIPE: 'bg-blue-500/20 text-blue-400',
  MERCADOPAGO: 'bg-sky-500/20 text-sky-400',
  SPEI: 'bg-green-500/20 text-green-400',
}

interface PageProps {
  searchParams: Promise<{
    status?: string
    method?: string
    q?: string
    from?: string
    to?: string
    page?: string
  }>
}

const PAGE_SIZE = 50

async function getOrdersData(filters: {
  status?: string
  method?: string
  q?: string
  from?: string
  to?: string
  page: number
}) {
  const where: Record<string, unknown> = {}

  if (filters.status && STATUSES.includes(filters.status as OrderStatus)) {
    where.status = filters.status
  }

  if (filters.method && PAYMENT_METHODS.includes(filters.method as PaymentMethod)) {
    where.paymentMethod = filters.method
  }

  if (filters.from || filters.to) {
    const createdAt: Record<string, Date> = {}
    if (filters.from) createdAt.gte = new Date(filters.from)
    if (filters.to) createdAt.lte = new Date(filters.to + 'T23:59:59')
    where.createdAt = createdAt
  }

  if (filters.q) {
    const q = filters.q.trim()
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [orders, total, statusCounts, todayStats] = await Promise.all([
    db.order.findMany({
      where,
      take: PAGE_SIZE,
      skip: (filters.page - 1) * PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { id: true } },
      },
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ['status'], _count: true }),
    db.order.aggregate({
      where: {
        createdAt: { gte: today, lte: todayEnd },
        paymentStatus: 'PAID',
      },
      _sum: { total: true },
      _count: true,
    }),
  ])

  const pendingCount = statusCounts.find((s) => s.status === 'PENDING')?._count ?? 0
  const processingCount = statusCounts.find((s) => s.status === 'PROCESSING')?._count ?? 0
  const todayOrdersCount = (await db.order.count({ where: { createdAt: { gte: today, lte: todayEnd } } }))

  return {
    orders,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    statusCounts,
    stats: {
      todayOrders: todayOrdersCount,
      pending: pendingCount,
      processing: processingCount,
      todayRevenue: Number(todayStats._sum.total ?? 0),
    },
  }
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))
  const { orders, total, totalPages, stats, statusCounts } = await getOrdersData({
    status: sp.status,
    method: sp.method,
    q: sp.q,
    from: sp.from,
    to: sp.to,
    page,
  })

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { status: sp.status, method: sp.method, q: sp.q, from: sp.from, to: sp.to, page: '1', ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    return `/admin/orders?${params.toString()}`
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Pedidos</h1>
        <p className="text-brand-muted text-sm mt-1">{total} pedidos en total</p>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-brand-muted">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Pedidos hoy</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{stats.todayOrders}</p>
        </div>
        <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-brand-muted">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Pendientes</span>
          </div>
          <p className="text-2xl font-display font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-brand-muted">
            <Loader2 className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Procesando</span>
          </div>
          <p className="text-2xl font-display font-bold text-yellow-400">{stats.processing}</p>
        </div>
        <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 text-brand-muted">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Ingresos hoy</span>
          </div>
          <p className="text-2xl font-display font-bold text-brand-success">{formatPrice(stats.todayRevenue)}</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl({ status: undefined })}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            !sp.status
              ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent'
              : 'border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
          }`}
        >
          Todos ({total})
        </Link>
        {STATUSES.map((s) => {
          const count = statusCounts.find((sc) => sc.status === s)?._count ?? 0
          return (
            <Link
              key={s}
              href={buildUrl({ status: s })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                sp.status === s
                  ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent'
                  : 'border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
              }`}
            >
              <OrderStatusBadge status={s} showDot={false} />
              <span className="ml-1 text-brand-muted">({count})</span>
            </Link>
          )
        })}
      </div>

      {/* Filters bar */}
      <form method="get" action="/admin/orders" className="flex flex-wrap items-end gap-3">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <div className="flex-1 min-w-48">
          <label className="block text-xs text-brand-muted mb-1.5 font-medium uppercase tracking-wider">
            Buscar
          </label>
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Número de pedido, email o nombre..."
            className="w-full h-9 rounded-lg bg-brand-surface border border-brand-border px-3 text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-brand-muted mb-1.5 font-medium uppercase tracking-wider">
            Método de pago
          </label>
          <select
            name="method"
            defaultValue={sp.method ?? ''}
            className="h-9 rounded-lg bg-brand-surface border border-brand-border px-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
          >
            <option value="">Todos</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-brand-muted mb-1.5 font-medium uppercase tracking-wider">
            Desde
          </label>
          <input
            type="date"
            name="from"
            defaultValue={sp.from}
            className="h-9 rounded-lg bg-brand-surface border border-brand-border px-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-brand-muted mb-1.5 font-medium uppercase tracking-wider">
            Hasta
          </label>
          <input
            type="date"
            name="to"
            defaultValue={sp.to}
            className="h-9 rounded-lg bg-brand-surface border border-brand-border px-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>
        <button
          type="submit"
          className="h-9 px-4 rounded-lg bg-brand-accent text-white text-sm font-semibold hover:bg-[#e04d18] transition-colors"
        >
          Filtrar
        </button>
        {(sp.q || sp.method || sp.from || sp.to) && (
          <Link
            href="/admin/orders"
            className="h-9 px-4 rounded-lg border border-brand-border text-brand-muted text-sm font-semibold hover:text-white hover:border-brand-muted transition-colors flex items-center"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* Orders table */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Pedido</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Cliente</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Pago</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Estado</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Total</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Fecha</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-border/20 transition-colors group">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-sm font-semibold text-brand-accent hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <div className="text-xs text-brand-muted mt-0.5">
                      {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-white font-medium">{order.user.name ?? '—'}</div>
                    <div className="text-xs text-brand-muted">{order.user.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${PAYMENT_METHOD_COLORS[order.paymentMethod as PaymentMethod]}`}>
                      {PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-white">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-brand-muted whitespace-nowrap">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-muted hover:text-white"
                      aria-label="Ver pedido"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-brand-muted text-sm">
                    No se encontraron pedidos con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-brand-border flex items-center justify-between gap-4">
            <p className="text-xs text-brand-muted">
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} de {total} pedidos
            </p>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="h-7 px-3 text-xs rounded-md text-brand-muted hover:text-white hover:bg-brand-border transition-colors flex items-center"
                >
                  ← Anterior
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`w-7 h-7 text-xs rounded-md flex items-center justify-center transition-colors ${
                    p === page
                      ? 'bg-brand-accent text-white font-semibold'
                      : 'text-brand-muted hover:text-white hover:bg-brand-border'
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="h-7 px-3 text-xs rounded-md text-brand-muted hover:text-white hover:bg-brand-border transition-colors flex items-center"
                >
                  Siguiente →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
