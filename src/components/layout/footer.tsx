import Link from 'next/link'
import { Zap } from 'lucide-react'

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
function FbIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

const LINKS = {
  tienda: [
    { href: '/catalog', label: 'Catálogo' },
    { href: '/drops', label: 'Drops' },
    { href: '/coupons', label: 'Cupones' },
    { href: '/delivery', label: 'Cobertura' },
  ],
  cuenta: [
    { href: '/account', label: 'Mi cuenta' },
    { href: '/orders', label: 'Mis pedidos' },
    { href: '/wishlist', label: 'Lista de deseos' },
  ],
  empresa: [
    { href: '/about', label: 'Nosotros' },
    { href: '/contact', label: 'Contacto' },
    { href: '/help', label: 'Ayuda' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-brand-surface border-t border-brand-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-black text-sm tracking-widest">SNEAKERSMON HIDALGO</span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed max-w-xs">
              La tienda definitiva de sneakers premium. Drops exclusivos, ediciones limitadas y entrega directa en Hidalgo, CDMX y Querétaro.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { href: 'https://instagram.com/sneakersmon', icon: IgIcon, label: 'Instagram' },
                { href: 'https://twitter.com/sneakersmon', icon: XIcon, label: 'Twitter' },
                { href: 'https://facebook.com/sneakersmon', icon: FbIcon, label: 'Facebook' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-accent hover:border-brand-accent transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-brand-muted mb-4">
                {title.charAt(0).toUpperCase() + title.slice(1)}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-muted hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-brand-muted">
            © 2026 SneakersMon Hidalgo. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-brand-muted">
            <Link href="/help#privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/help#terminos" className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
