'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import Link from 'next/link'
import { User, MapPin, ShoppingBag, Shield } from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/account', label: 'Perfil', icon: User, exact: true },
  { href: '/account/addresses', label: 'Direcciones', icon: MapPin },
  { href: '/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/account/security', label: 'Seguridad', icon: Shield },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const user = session?.user
  const initials = user?.name ? getInitials(user.name) : '??'

  return (
    <div className="min-h-screen bg-brand-black py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* User card */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-4">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name ?? 'Avatar'}
                    className="w-14 h-14 rounded-full object-cover border-2 border-brand-accent"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-brand-accent flex items-center justify-center font-bold text-lg text-white flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold truncate">{user?.name ?? 'Usuario'}</p>
                  <p className="text-brand-muted text-sm truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
              {NAV_ITEMS.map((item, idx) => {
                const Icon = item.icon
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all',
                      idx < NAV_ITEMS.length - 1 && 'border-b border-brand-border',
                      isActive
                        ? 'text-brand-accent bg-brand-accent/5 border-l-2 border-l-brand-accent pl-[18px]'
                        : 'text-brand-muted hover:text-white hover:bg-brand-elevated'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  )
}
