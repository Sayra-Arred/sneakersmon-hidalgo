'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, MapPin, Phone } from 'lucide-react'

/* ── Social icons ── */
function IgIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
}
function TikTokIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/></svg>
}
function FbIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
}
function XIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
}
function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
}

const SOCIAL_LINKS = [
  { href: 'https://instagram.com/sneakersmon_hidalgo', icon: IgIcon,       label: 'Instagram', handle: '@sneakersmon_hidalgo', bg: 'from-purple-600 to-pink-500' },
  { href: 'https://tiktok.com/@sneakersmon',           icon: TikTokIcon,   label: 'TikTok',    handle: '@sneakersmon',          bg: 'from-gray-800 to-black'     },
  { href: 'https://facebook.com/sneakersmon',          icon: FbIcon,       label: 'Facebook',  handle: 'SneakersMon Hidalgo',   bg: 'from-blue-600 to-blue-700'  },
  { href: 'https://twitter.com/sneakersmon',           icon: XIcon,        label: 'Twitter/X', handle: '@sneakersmon',          bg: 'from-gray-700 to-gray-900'  },
  { href: 'https://wa.me/527711234567',                icon: WhatsAppIcon, label: 'WhatsApp',  handle: '+52 771 123 4567',      bg: 'from-green-600 to-green-700' },
]

const PAYMENT_METHODS = [
  { name: 'VISA',         emoji: '💳' },
  { name: 'Mastercard',   emoji: '💳' },
  { name: 'OXXO',         emoji: '🏪' },
  { name: 'SPEI',         emoji: '🏦' },
  { name: 'Mercado Pago', emoji: '🛒' },
  { name: 'Transferencia',emoji: '🏧' },
  { name: 'Efectivo',     emoji: '💵' },
]

const NAV_LINKS = {
  Tienda:   [{ href: '/catalog', label: 'Catálogo' }, { href: '/drops', label: 'Drops Exclusivos' }, { href: '/coupons', label: 'Cupones' }, { href: '/delivery', label: 'Cobertura de Entrega' }],
  Cuenta:   [{ href: '/account', label: 'Mi Cuenta' }, { href: '/orders', label: 'Mis Pedidos' }, { href: '/wishlist', label: 'Lista de Deseos' }],
  Nosotros: [{ href: '/about', label: 'Quiénes Somos' }, { href: '/contact', label: 'Contacto' }, { href: '/help', label: 'Centro de Ayuda' }],
}

// Emoji decoration row: bears + sneakers + money bills
const DECO = ['🐻','👟','💵','🐻','💸','👟','🐻','💰','👟','🐻','💵','🐻','👟','💸','💰','🐻']

const animVariants = [
  { y: [0, -10, 0], rotate: [0, 8, 0]  },
  { y: [0, -6, 0],  rotate: [0, -6, 0] },
  { y: [0, -14, 0], rotate: [0, 12, 0] },
  { y: [0, -8, 0],  rotate: [0, -10, 0]},
]

export function Footer() {
  return (
    <footer className="relative bg-brand-surface border-t border-brand-border mt-24 overflow-hidden">

      {/* Subtle bear texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Ctext x='6' y='44' font-size='26'%3E🐻%3C/text%3E%3Ctext x='50' y='84' font-size='22'%3E👟%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '90px 90px',
        }}
        aria-hidden="true"
      />

      {/* ─────────────────────────────────────────
          1. BRAND + NAV LINKS
      ───────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">

          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              {/* Bear logo instead of lightning */}
              <motion.div
                className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.4 }}
              >
                🐻
              </motion.div>
              <div>
                <span className="font-display font-black text-sm tracking-widest block text-white group-hover:text-brand-accent transition-colors">SNEAKERSMON</span>
                <span className="font-display font-black text-sm tracking-widest block gradient-text">HIDALGO</span>
              </div>
            </Link>

            <p className="text-brand-muted text-sm leading-relaxed max-w-xs mb-5">
              La tienda definitiva de sneakers premium en Hidalgo. Drops exclusivos, ediciones limitadas y entrega directa a tu puerta.
            </p>

            {/* Stores quick info */}
            <div className="space-y-2 mb-5">
              {[
                { city: 'Actopan, Hidalgo', icon: '🏙️' },
                { city: 'Apan, Hidalgo',    icon: '🌾' },
              ].map((s) => (
                <div key={s.city} className="flex items-center gap-2 text-xs text-brand-muted">
                  <MapPin className="w-3 h-3 text-brand-accent flex-shrink-0" />
                  <span>{s.icon} {s.city}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <Phone className="w-3 h-3 text-brand-accent flex-shrink-0" />
                <a href="tel:7711234567" className="hover:text-white transition-colors">771 123 4567</a>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              href="https://wa.me/527711234567"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-xs font-bold rounded-xl hover:bg-[#1fac56] transition-colors shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              Contáctanos por WhatsApp
            </motion.a>
          </div>

          {/* Nav columns */}
          {Object.entries(NAV_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-white mb-5 pb-2 border-b border-brand-border">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-brand-muted hover:text-brand-accent transition-colors flex items-center gap-1.5 group">
                      <span className="w-1 h-1 rounded-full bg-brand-border group-hover:bg-brand-accent transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────
          2. SOCIAL MEDIA
      ───────────────────────────────────────── */}
      <div className="relative border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <p className="font-display font-black text-xs uppercase tracking-[0.3em] gradient-text mb-1">
              Síguenos en redes sociales
            </p>
            <p className="text-brand-muted text-xs">Drops, novedades y contenido exclusivo todos los días</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SOCIAL_LINKS.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-brand-border bg-brand-elevated overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} aria-hidden="true" />
                <div className="relative z-10 flex items-center gap-3 w-full min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
                    <s.icon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white leading-none">{s.label}</p>
                    <p className="text-[10px] text-brand-muted truncate mt-0.5 group-hover:text-white/80 transition-colors">{s.handle}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          3. PAYMENT METHODS
      ───────────────────────────────────────── */}
      <div className="relative border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-brand-muted mb-4">
              🔒 Métodos de pago aceptados
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PAYMENT_METHODS.map((pm, i) => (
                <motion.div
                  key={pm.name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-elevated border border-brand-border rounded-full cursor-default"
                >
                  <motion.span
                    className="text-sm"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {pm.emoji}
                  </motion.span>
                  <span className="text-[11px] font-semibold text-white whitespace-nowrap">{pm.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          4. ANIMATED EMOJI STRIP
      ───────────────────────────────────────── */}
      <div className="border-t border-brand-border py-4 overflow-hidden select-none" aria-hidden="true">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-4">
          {DECO.map((e, i) => (
            <motion.span
              key={i}
              className="text-xl sm:text-2xl opacity-30 cursor-default"
              animate={animVariants[i % animVariants.length]}
              whileHover={{ opacity: 0.85, scale: 1.4 }}
              transition={{
                duration: 1.8 + (i % 4) * 0.4,
                delay: i * 0.12,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {e}
            </motion.span>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────
          5. COPYRIGHT
      ───────────────────────────────────────── */}
      <div className="border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-muted text-center sm:text-left">
            © 2026 SneakersMon Hidalgo · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-5 text-xs text-brand-muted">
            <Link href="/help#privacidad" className="hover:text-white transition-colors">Aviso de Privacidad</Link>
            <Link href="/help#terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          6. AGENCY CREDIT (fondo absoluto)
      ───────────────────────────────────────── */}
      <div
        className="border-t py-3 px-4"
        style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.4)' }}
      >
        <p className="text-center text-[10px] sm:text-[11px] text-brand-border leading-relaxed tracking-wide max-w-3xl mx-auto">
          ESTE PRODUCTO ESTÁ HECHO POR{' '}
          <span className="text-brand-muted font-semibold">
            AGENCIA DE PUBLICIDAD Y TECNOLOGÍAS CENTRAL CONDESA MX
          </span>{' '}
          ·{' '}
          <a href="tel:5564548088" className="text-brand-muted hover:text-brand-accent transition-colors font-mono">
            55 6454 8088
          </a>{' '}
          · OFICINAS EN{' '}
          <span className="text-brand-muted">PACHUCA HIDALGO</span>{' '}
          Y{' '}
          <span className="text-brand-muted">CIUDAD DE MÉXICO</span>
        </p>
      </div>

    </footer>
  )
}
