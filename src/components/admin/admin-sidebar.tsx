'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ShoppingCart,
  Tag,
  Users,
  Zap,
  Star,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/inventory', label: 'Inventario', icon: BarChart3 },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/coupons', label: 'Cupones', icon: Tag },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/drops', label: 'Drops', icon: Zap },
  { href: '/admin/reviews', label: 'Reseñas', icon: Star },
  { href: '/admin/audit-logs', label: 'Auditoría', icon: Shield },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 bg-brand-surface border-r border-brand-border flex flex-col h-full overflow-y-auto">
      <div className="p-5 border-b border-brand-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-accent rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="font-display font-black text-xs tracking-widest uppercase">Sneakersmon</div>
            <div className="text-[10px] text-brand-muted uppercase tracking-wider">Admin</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20'
                  : 'text-brand-muted hover:text-white hover:bg-brand-elevated'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-brand-border">
        <Link
          href="/"
          className="text-xs text-brand-muted hover:text-white transition-colors"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </aside>
  )
}
