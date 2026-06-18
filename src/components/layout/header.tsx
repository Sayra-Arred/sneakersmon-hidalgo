'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Search, Heart, User, Menu, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cart-store'
import { useUIStore } from '@/store/ui-store'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { href: '/catalog', label: 'Catálogo' },
  { href: '/drops', label: 'Drops' },
  { href: '/coupons', label: 'Cupones' },
  { href: '/delivery', label: 'Cobertura' },
]

export function Header() {
  const pathname = usePathname()
  const { getItemCount, openCart } = useCartStore()
  const { openSearch, openMobileNav } = useUIStore()
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const count = getItemCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-brand-border shadow-card'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-sm tracking-widest uppercase hidden sm:block group-hover:text-brand-accent transition-colors">
              SNEAKERSMON
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  pathname.startsWith(link.href)
                    ? 'text-brand-accent'
                    : 'text-brand-muted hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={openSearch}
              aria-label="Buscar"
              className="p-2 text-brand-muted hover:text-white transition-colors rounded-lg hover:bg-brand-elevated"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/wishlist"
              aria-label="Lista de deseos"
              className="p-2 text-brand-muted hover:text-white transition-colors rounded-lg hover:bg-brand-elevated"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <Link
              href={isAuthenticated ? '/account' : '/login'}
              aria-label="Mi cuenta"
              className="p-2 text-brand-muted hover:text-white transition-colors rounded-lg hover:bg-brand-elevated"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={openCart}
              aria-label={`Carrito (${count})`}
              className="relative p-2 text-brand-muted hover:text-white transition-colors rounded-lg hover:bg-brand-elevated"
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={openMobileNav}
              aria-label="Menú"
              className="lg:hidden p-2 text-brand-muted hover:text-white transition-colors rounded-lg hover:bg-brand-elevated"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
