'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Zap,
  LayoutGrid,
  Sparkles,
  Tag,
  MapPin,
  User,
  ShoppingBag,
  Heart,
  LogIn,
} from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/catalog', label: 'Catálogo', icon: LayoutGrid },
  { href: '/drops', label: 'Drops', icon: Sparkles },
  { href: '/coupons', label: 'Cupones', icon: Tag },
  { href: '/delivery', label: 'Cobertura', icon: MapPin },
]

const ACCOUNT_LINKS = [
  { href: '/account', label: 'Mi cuenta', icon: User, authOnly: true },
  { href: '/orders', label: 'Mis pedidos', icon: ShoppingBag, authOnly: true },
  { href: '/wishlist', label: 'Lista de deseos', icon: Heart, authOnly: false },
]

export function MobileNav() {
  const { isMobileNavOpen, closeMobileNav } = useUIStore()
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  function handleLinkClick() {
    closeMobileNav()
  }

  return (
    <AnimatePresence>
      {isMobileNavOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="mobile-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={closeMobileNav}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="mobile-nav-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-brand-surface border-r border-brand-border flex flex-col shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border flex-shrink-0">
              <Link href="/" onClick={handleLinkClick} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-black text-sm tracking-widest uppercase">
                  SNEAKERSMON
                </span>
              </Link>
              <button
                onClick={closeMobileNav}
                aria-label="Cerrar menú"
                className="p-2 rounded-lg text-brand-muted hover:text-white hover:bg-brand-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
              {/* Main nav */}
              <nav>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted px-2 mb-3">
                  Tienda
                </p>
                <ul className="space-y-1">
                  {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href)
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={handleLinkClick}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                            active
                              ? 'bg-brand-accent/10 text-brand-accent'
                              : 'text-brand-muted hover:text-white hover:bg-brand-elevated'
                          )}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {label}
                          {active && (
                            <motion.span
                              layoutId="mobile-nav-active"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-accent"
                            />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Account links */}
              <nav>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted px-2 mb-3">
                  Cuenta
                </p>
                <ul className="space-y-1">
                  {ACCOUNT_LINKS.filter((l) => !l.authOnly || isAuthenticated).map(
                    ({ href, label, icon: Icon }) => {
                      const active = pathname.startsWith(href)
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={handleLinkClick}
                            className={cn(
                              'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                              active
                                ? 'bg-brand-accent/10 text-brand-accent'
                                : 'text-brand-muted hover:text-white hover:bg-brand-elevated'
                            )}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {label}
                          </Link>
                        </li>
                      )
                    }
                  )}
                  {!isAuthenticated && (
                    <li>
                      <Link
                        href="/login"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-brand-muted hover:text-white hover:bg-brand-elevated transition-colors"
                      >
                        <LogIn className="w-5 h-5 flex-shrink-0" />
                        Iniciar sesión
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-brand-border px-6 py-5">
              <p className="text-xs text-brand-muted text-center">
                © 2026 SneakersMon Hidalgo
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
