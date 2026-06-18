'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { MapPin, Clock, Phone, Navigation, Store, ChevronRight } from 'lucide-react'
import { useTilt } from '@/hooks/use-tilt'

const STORES = [
  {
    id: 'actopan',
    city: 'Actopan',
    state: 'Hidalgo',
    emoji: '🏙️',
    address: 'Av. Juárez 45, Centro',
    colonia: 'Colonia Centro',
    cp: 'C.P. 42500',
    phone: '771 123 4567',
    hours: [
      { days: 'Lun – Vie', time: '10:00 – 20:00' },
      { days: 'Sábado',    time: '10:00 – 21:00' },
      { days: 'Domingo',   time: '11:00 – 18:00' },
    ],
    mapsUrl: 'https://maps.google.com/?q=Actopan,Hidalgo,Mexico',
    wazeUrl: 'https://waze.com/ul?q=Actopan+Hidalgo+Mexico',
    accent: '#FF5A1F',
    tag: 'Tienda Principal',
    tagColor: 'bg-brand-accent',
    features: ['Sneakers Exclusivos', 'Drops Presenciales', 'Cambios y Devoluciones'],
  },
  {
    id: 'apan',
    city: 'Apan',
    state: 'Hidalgo',
    emoji: '🌾',
    address: 'Calle Hidalgo 12, Centro Histórico',
    colonia: 'Zona Centro',
    cp: 'C.P. 43900',
    phone: '748 456 7890',
    hours: [
      { days: 'Lun – Vie', time: '10:00 – 19:00' },
      { days: 'Sábado',    time: '10:00 – 20:00' },
      { days: 'Domingo',   time: '11:00 – 17:00' },
    ],
    mapsUrl: 'https://maps.google.com/?q=Apan,Hidalgo,Mexico',
    wazeUrl: 'https://waze.com/ul?q=Apan+Hidalgo+Mexico',
    accent: '#D4AF37',
    tag: 'Sucursal',
    tagColor: 'bg-brand-gold',
    features: ['Catálogo Completo', 'Atención Personalizada', 'Apartado y Crédito'],
  },
]

const TITLE = 'NUESTRAS TIENDAS'.split('')

function StoreCard({ store, index, inView }: { store: typeof STORES[0]; index: number; inView: boolean }) {
  const { ref, style, glow, onMove, onLeave } = useTilt(10)
  const [tab, setTab] = useState<'info' | 'hours'>('info')

  return (
    <motion.div
      ref={ref}
      style={{ ...style, willChange: 'transform', transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2 + index * 0.18, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-brand-elevated border border-brand-border rounded-2xl overflow-hidden"
    >
      {/* Mouse spotlight */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(320px circle at ${glow.x}px ${glow.y}px, ${store.accent}22, transparent 65%)`,
        }}
        aria-hidden="true"
      />
      {/* Hover border glow */}
      <div
        className="absolute inset-0 pointer-events-none z-10 rounded-2xl transition-opacity duration-300"
        style={{ opacity: glow.opacity, boxShadow: `inset 0 0 0 1.5px ${store.accent}99, 0 0 32px ${store.accent}33` }}
        aria-hidden="true"
      />

      {/* Header banner */}
      <div
        className="relative h-28 sm:h-36 flex items-end p-5 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${store.accent}22 0%, #000 100%)` }}
      >
        {/* Bear + sneaker texture in header */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ctext x='4' y='40' font-size='24'%3E🐻%3C/text%3E%3Ctext x='44' y='76' font-size='20'%3E👟%3C/text%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
            opacity: 0.08,
          }}
          aria-hidden="true"
        />

        {/* Glowing circle */}
        <div
          className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-20 blur-xl"
          style={{ background: store.accent }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-end justify-between w-full">
          <div>
            <span className={`${store.tagColor} text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full mb-2 inline-block`}>
              {store.tag}
            </span>
            <div className="flex items-center gap-2">
              <motion.span
                className="text-3xl sm:text-4xl"
                animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 2.5, delay: index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {store.emoji}
              </motion.span>
              <div>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white leading-none">{store.city}</h3>
                <p className="text-brand-muted text-xs tracking-widest uppercase">{store.state}</p>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-brand-border relative z-20" style={{ transform: 'translateZ(8px)' }}>
        {(['info', 'hours'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
              tab === t ? 'text-white border-b-2' : 'text-brand-muted hover:text-white border-b-2 border-transparent'
            }`}
            style={tab === t ? { borderColor: store.accent } : {}}
          >
            {t === 'info' ? '📍 Ubicación' : '🕐 Horarios'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 relative z-20" style={{ transform: 'translateZ(16px)' }}>
        {tab === 'info' ? (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${store.accent}20` }}>
                <MapPin className="w-4 h-4" style={{ color: store.accent }} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{store.address}</p>
                <p className="text-brand-muted text-xs">{store.colonia} · {store.cp}</p>
                <p className="text-brand-muted text-xs">{store.city}, Hidalgo, México</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${store.accent}20` }}>
                <Phone className="w-4 h-4" style={{ color: store.accent }} />
              </div>
              <a href={`tel:${store.phone}`} className="text-white text-sm font-semibold hover:underline">
                {store.phone}
              </a>
            </div>

            {/* Features */}
            <div className="space-y-1.5">
              {store.features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: store.accent }} />
                  <span className="text-xs text-brand-muted">{f}</span>
                </div>
              ))}
            </div>

            {/* Map buttons */}
            <div className="flex gap-2 pt-1">
              <motion.a
                href={store.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors"
                style={{ background: store.accent }}
              >
                <Navigation className="w-3.5 h-3.5" />
                Google Maps
              </motion.a>
              <motion.a
                href={store.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-muted hover:text-white hover:border-white/30 transition-colors"
              >
                🚗 Waze
              </motion.a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="hours"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: store.accent }} />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Horario de atención</span>
            </div>
            {store.hours.map((h) => (
              <div key={h.days} className="flex items-center justify-between py-2.5 px-3 bg-brand-surface rounded-xl border border-brand-border">
                <span className="text-sm text-brand-muted">{h.days}</span>
                <span className="text-sm font-bold text-white font-mono">{h.time}</span>
              </div>
            ))}
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl" style={{ background: `${store.accent}12`, border: `1px solid ${store.accent}30` }}>
              <span className="text-lg">🐻</span>
              <p className="text-xs" style={{ color: store.accent }}>¡Visítanos y encuentra tu par ideal!</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function StoresSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="relative py-16 sm:py-24 bg-brand-black overflow-hidden">

      {/* Texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='8' y='50' font-size='28'%3E🐻%3C/text%3E%3Ctext x='56' y='94' font-size='24'%3E👟%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
          opacity: 0.04,
        }}
        aria-hidden="true"
      />

      {/* Glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            className="flex items-center justify-center gap-2 mb-3"
            initial={{ opacity: 0, y: -16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <motion.span className="text-xl" animate={{ y: [0,-6,0] }} transition={{ duration: 2, repeat: Infinity }}>🐻</motion.span>
            <span className="text-xs font-bold tracking-widest uppercase text-brand-accent">Encuéntranos</span>
            <motion.span className="text-xl" animate={{ y: [0,-6,0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>👟</motion.span>
          </motion.div>

          {/* Animated title */}
          <div className="flex flex-wrap justify-center font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight overflow-hidden">
            {TITLE.map((ch, i) => (
              <motion.span
                key={i}
                className={ch === ' ' ? 'inline-block w-3 sm:w-4' : 'inline-block'}
                style={ch !== ' ' ? {
                  background: 'linear-gradient(135deg, #fff 30%, rgba(255,90,31,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                } : {}}
                initial={{ opacity: 0, y: 36, rotateX: -40 }}
                animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {ch}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="w-24 h-1 rounded-full mx-auto mt-3"
            style={{ background: 'linear-gradient(90deg, #FF5A1F, #D4AF37)' }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.p
            className="text-brand-muted text-sm mt-4 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
          >
            Dos tiendas físicas en Hidalgo para que encuentres tu par perfecto en persona.
          </motion.p>
        </div>

        {/* Store cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {STORES.map((store, i) => (
            <StoreCard key={store.id} store={store} index={i} inView={inView} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9 }}
        >
          <p className="text-brand-muted text-xs flex items-center justify-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-accent" />
            Ambas tiendas aceptan todos los métodos de pago y realizan cambios sin costo
            <MapPin className="w-3.5 h-3.5 text-brand-accent" />
          </p>
        </motion.div>
      </div>
    </section>
  )
}
