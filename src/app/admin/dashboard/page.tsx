// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { StatsCard } from '@/components/admin/stats-card'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { OrderStatus } from '@/types'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

async function getKPIs() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth,
    ordersLastMonth,
    totalProducts,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    db.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { total: true },
    }),
    db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.order.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    db.product.count({ where: { status: 'ACTIVE' } }),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { id: true } },
      },
    }),
    db.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ])

  const revThis = Number(revenueThisMonth._sum.total ?? 0)
  const revLast = Number(revenueLastMonth._sum.total ?? 0)
  const revenueChange = revLast > 0 ? ((revThis - revLast) / revLast) * 100 : 0
  const ordersChange =
    ordersLastMonth > 0 ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0

  const avgTicket = ordersThisMonth > 0 ? revThis / ordersThisMonth : 0

  const topProductIds = topProducts.map((p) => p.productId)
  const topProductDetails = await db.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, slug: true },
  })

  const topProductsList = topProducts.map((tp) => ({
    ...tp,
    product: topProductDetails.find((p) => p.id === tp.productId),
  }))

  return {
    revThis,
    revenueChange,
    ordersThisMonth,
    ordersChange,
    avgTicket,
    totalProducts,
    recentOrders,
    topProductsList,
  }
}

export default async function AdminDashboardPage() {
  const kpi = await getKPIs()

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-brand-muted text-sm mt-1">Vista general del negocio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Ingresos del mes"
          value={kpi.revThis}
          change={kpi.revenueChange}
          trend={kpi.revenueChange >= 0 ? 'up' : 'down'}
          icon={DollarSign}
          format="currency"
        />
        <StatsCard
          label="Pedidos del mes"
          value={kpi.ordersThisMonth}
          change={kpi.ordersChange}
          trend={kpi.ordersChange >= 0 ? 'up' : 'down'}
          icon={ShoppingCart}
        />
        <StatsCard
          label="Ticket promedio"
          value={kpi.avgTicket}
          icon={TrendingUp}
          format="currency"
        />
        <StatsCard
          label="Productos activos"
          value={kpi.totalProducts}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-brand-border flex items-center justify-between">
            <h2 className="font-display font-bold text-white">Pedidos recientes</h2>
            <Link href="/admin/orders" className="text-sm text-brand-accent hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-brand-border">
            {kpi.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-border/30 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-mono font-medium text-white">{order.orderNumber}</div>
                  <div className="text-xs text-brand-muted">{order.user.name ?? order.user.email}</div>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                  <div className="text-right">
                    <div className="text-sm font-mono font-semibold text-white">
                      {formatPrice(Number(order.total))}
                    </div>
                    <div className="text-xs text-brand-muted">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
              </Link>
            ))}
            {kpi.recentOrders.length === 0 && (
              <p className="p-6 text-center text-brand-muted text-sm">Sin pedidos todavía</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-brand-border">
            <h2 className="font-display font-bold text-white">Top productos</h2>
          </div>
          <div className="divide-y divide-brand-border">
            {kpi.topProductsList.map((item, i) => (
              <div key={item.productId} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-sm font-mono text-brand-muted w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.product?.name ?? 'Producto eliminado'}
                  </p>
                  <p className="text-xs text-brand-muted">{item._sum.quantity ?? 0} unidades</p>
                </div>
              </div>
            ))}
            {kpi.topProductsList.length === 0 && (
              <p className="p-6 text-center text-brand-muted text-sm">Sin ventas todavía</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
