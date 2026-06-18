'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ShoppingBag, Heart, MapPin, ArrowRight, Package, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderSummary } from '@/types/order'
import type { OrderStatus } from '@/types/order'

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

interface AccountStats {
  ordersCount: number
  wishlistCount: number
  addressesCount: number
}

export default function AccountPage() {
  const { data: session } = useSession()
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([])
  const [stats, setStats] = useState<AccountStats>({ ordersCount: 0, wishlistCount: 0, addressesCount: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [ordersRes, wishlistRes, addressesRes] = await Promise.allSettled([
          fetch('/api/orders').then((r) => r.json()),
          fetch('/api/wishlist').then((r) => r.json()),
          fetch('/api/account/addresses').then((r) => r.json()),
        ])

        if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
          const orders: OrderSummary[] = ordersRes.value.data ?? []
          setRecentOrders(orders.slice(0, 3))
          setStats((s) => ({ ...s, ordersCount: orders.length }))
        }
        if (wishlistRes.status === 'fulfilled' && wishlistRes.value.success) {
          setStats((s) => ({ ...s, wishlistCount: wishlistRes.value.data?.length ?? 0 }))
        }
        if (addressesRes.status === 'fulfilled' && addressesRes.value.success) {
          setStats((s) => ({ ...s, addressesCount: addressesRes.value.data?.length ?? 0 }))
        }
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Usuario'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <h1 className="font-display font-black text-2xl">
          Hola, {firstName} 👋
        </h1>
        <p className="text-brand-muted mt-1">
          Aquí puedes ver y gestionar toda la información de tu cuenta.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pedidos', value: stats.ordersCount, icon: ShoppingBag, href: '/orders' },
          { label: 'Wishlist', value: stats.wishlistCount, icon: Heart, href: '/wishlist' },
          { label: 'Direcciones', value: stats.addressesCount, icon: MapPin, href: '/account/addresses' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center hover:border-brand-accent transition-colors group"
            >
              <Icon className="w-6 h-6 text-brand-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-display font-black text-2xl">
                {isLoading ? '—' : stat.value}
              </p>
              <p className="text-brand-muted text-xs mt-0.5">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-accent" />
            <h2 className="font-bold">Pedidos recientes</h2>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-1 text-brand-accent text-sm hover:underline"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-brand-elevated rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <ShoppingBag className="w-12 h-12 text-brand-muted mb-3" />
            <p className="font-semibold">Aún no tienes pedidos</p>
            <p className="text-brand-muted text-sm mt-1">¡Explora nuestro catálogo y encuentra tu par ideal!</p>
            <Link
              href="/catalog"
              className="mt-4 inline-flex items-center gap-2 text-brand-accent text-sm font-semibold hover:underline"
            >
              Ir al catálogo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-brand-elevated transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-elevated border border-brand-border flex items-center justify-center flex-shrink-0">
                    {order.primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={order.primaryImage} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-brand-muted" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{order.orderNumber}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-brand-muted" />
                      <p className="text-brand-muted text-xs">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={STATUS_VARIANT[order.status]}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                  <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                  <ArrowRight className="w-4 h-4 text-brand-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { href: '/account/addresses', label: 'Gestionar direcciones', desc: 'Agrega o edita tus direcciones de entrega', icon: MapPin },
          { href: '/account/security', label: 'Seguridad', desc: 'Cambia tu contraseña y configura 2FA', icon: Package },
        ].map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex items-center gap-4 hover:border-brand-accent transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-accent/20 transition-colors">
                <Icon className="w-5 h-5 text-brand-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{link.label}</p>
                <p className="text-brand-muted text-xs mt-0.5 truncate">{link.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-muted group-hover:text-brand-accent transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
