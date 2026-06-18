'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useEffect, useRef } from 'react'
import { MapPin, Clock, Truck, CheckCircle } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useTilt } from '@/hooks/use-tilt'

const COVERAGE_ZONES = [
  { name: 'Hidalgo',   icon: '🏔️', eta: '1-2 días hábiles', highlight: true,  description: 'Cobertura completa del estado' },
  { name: 'CDMX',     icon: '🏙️', eta: '1 día hábil',       highlight: false, description: 'Todas las alcaldías' },
  { name: 'Querétaro', icon: '🌿', eta: '2-3 días hábiles',  highlight: false, description: 'Zona metropolitana' },
]

const SHIPPING_TIERS = [
  { label: 'Compras +$3,000 MXN',       value: 'GRATIS', accent: true  },
  { label: 'Compras $1,500–$2,999',      value: '$99 MXN', accent: false },
  { label: 'Compras menores a $1,500',   value: '$149 MXN', accent: false },
]

const COVERAGE_FEATURES = [
  { id: 'hidalgo',   name: 'Hidalgo',   center: [-98.7, 20.1]  as [number,number], color: '#FF5A1F', opacity: 0.35,
    coordinates: [[-99.3,20.6],[-98.0,20.6],[-97.8,20.0],[-98.0,19.6],[-99.0,19.6],[-99.3,20.0],[-99.3,20.6]] },
  { id: 'cdmx',     name: 'CDMX',      center: [-99.13,19.43] as [number,number], color: '#D4AF37', opacity: 0.4,
    coordinates: [[-99.36,19.6],[-98.94,19.6],[-98.94,19.18],[-99.36,19.18],[-99.36,19.6]] },
  { id: 'queretaro',name: 'Querétaro', center: [-100.39,20.6] as [number,number], color: '#8E8E93', opacity: 0.3,
    coordinates: [[-100.9,21.1],[-99.7,21.1],[-99.5,20.1],[-100.3,19.9],[-100.9,20.4],[-100.9,21.1]] },
]

function ZoneCard({ zone, index, inView }: { zone: typeof COVERAGE_ZONES[0]; index: number; inView: boolean }) {
  const { ref, style, glow, onMove, onLeave } = useTilt(12)
  return (
    <motion.div
      ref={ref}
      style={{ ...style, willChange: 'transform', transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.4 + index * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col gap-1.5 p-4 rounded-[var(--radius-md)] border cursor-default overflow-hidden ${
        zone.highlight ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border bg-brand-elevated'
      }`}
    >
      {/* Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[var(--radius-md)]"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(200px circle at ${glow.x}px ${glow.y}px, ${zone.highlight ? 'rgba(255,90,31,0.22)' : 'rgba(212,175,55,0.18)'}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {/* Glow border */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[var(--radius-md)] transition-opacity duration-300"
        style={{
          opacity: glow.opacity,
          boxShadow: `inset 0 0 0 1px ${zone.highlight ? 'rgba(255,90,31,0.7)' : 'rgba(212,175,55,0.5)'}`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10" style={{ transform: 'translateZ(12px)' }}>
        <div className="flex items-center gap-2 mb-1">
          <motion.span
            className="text-xl"
            animate={{ y: [0,-4,0], rotate: [0,8,0] }}
            transition={{ duration: 2, delay: index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {zone.icon}
          </motion.span>
          <span className={`text-sm font-bold ${zone.highlight ? 'text-brand-accent' : 'text-white'}`}>
            {zone.name}
          </span>
        </div>
        <p className="text-[11px] text-brand-muted">{zone.description}</p>
        <div className="flex items-center gap-1 text-[11px] font-medium text-brand-gold mt-1">
          <Clock className="w-3 h-3" />
          {zone.eta}
        </div>
      </div>
    </motion.div>
  )
}

function ShippingRow({ tier, index, inView }: { tier: typeof SHIPPING_TIERS[0]; index: number; inView: boolean }) {
  const { ref, style, glow, onMove, onLeave } = useTilt(6)
  return (
    <motion.div
      ref={ref}
      style={{ ...style, willChange: 'transform' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
      className="relative flex items-center justify-between py-2.5 px-3 rounded-lg bg-brand-elevated border border-brand-border overflow-hidden cursor-default"
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: glow.opacity * 0.7,
          background: `radial-gradient(180px circle at ${glow.x}px ${glow.y}px, rgba(255,90,31,0.15), transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <span className="text-sm text-brand-muted relative z-10">{tier.label}</span>
      <span className={`text-sm font-bold relative z-10 ${tier.accent ? 'text-brand-success' : 'text-white'}`}>
        {tier.value}
      </span>
    </motion.div>
  )
}

function MapboxMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!token || !mapRef.current || mapInstanceRef.current) return
    let cancelled = false
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (cancelled || !mapRef.current) return
      mapboxgl.accessToken = token
      const map = new mapboxgl.Map({
        container: mapRef.current, style: 'mapbox://styles/mapbox/dark-v11',
        center: [-99.2, 20.1], zoom: 6.2, interactive: true, attributionControl: false,
      })
      mapInstanceRef.current = map
      map.on('load', () => {
        COVERAGE_FEATURES.forEach(zone => {
          map.addSource(zone.id, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [zone.coordinates] }, properties: { name: zone.name } } })
          map.addLayer({ id: `${zone.id}-fill`, type: 'fill', source: zone.id, paint: { 'fill-color': zone.color, 'fill-opacity': zone.opacity } })
          map.addLayer({ id: `${zone.id}-outline`, type: 'line', source: zone.id, paint: { 'line-color': zone.color, 'line-width': 2, 'line-opacity': 0.8 } })
          const el = document.createElement('div')
          el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${zone.color};border:2px solid white;box-shadow:0 0 0 4px ${zone.color}40;`
          new mapboxgl.Marker({ element: el }).setLngLat(zone.center).addTo(map)
        })
      })
    }).catch(() => {})
    return () => { cancelled = true; if (mapInstanceRef.current) { (mapInstanceRef.current as { remove: () => void }).remove(); mapInstanceRef.current = null } }
  }, [])
  return <div ref={mapRef} className="w-full h-full rounded-[var(--radius-lg)] overflow-hidden" aria-label="Mapa de cobertura" />
}

const TITLE1 = 'ENTREGA'.split('')
const TITLE2 = 'PREMIUM'.split('')

export function CoverageMapSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="relative py-16 sm:py-24 bg-brand-surface border-t border-brand-border overflow-hidden">

      {/* Texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Ctext x='10' y='58' font-size='34'%3E🐻%3C/text%3E%3Ctext x='65' y='110' font-size='30'%3E👟%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
          opacity: 0.04,
        }}
        aria-hidden="true"
      />

      {/* Glow center */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,90,31,0.07) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left */}
          <div className="flex flex-col gap-7">
            <div>
              <motion.div
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4 }}
              >
                <Truck className="w-4 h-4 text-brand-accent" />
                <span className="text-xs font-bold tracking-widest uppercase text-brand-accent">Logística propia</span>
                <motion.span animate={{ x: [0,4,0] }} transition={{ duration: 1.2, repeat: Infinity }}>🚚</motion.span>
              </motion.div>

              {/* Animated title */}
              <div className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                <div className="flex flex-wrap overflow-hidden">
                  {TITLE1.map((ch, i) => (
                    <motion.span key={i} className="inline-block"
                      style={{ background: 'linear-gradient(135deg,#fff 30%,rgba(255,90,31,0.8) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}
                      initial={{ opacity: 0, y: 35 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: [0.22,1,0.36,1] }}
                    >{ch}</motion.span>
                  ))}
                </div>
                <div className="flex flex-wrap overflow-hidden">
                  {TITLE2.map((ch, i) => (
                    <motion.span key={i} className="inline-block gradient-text"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.35 + i * 0.05, duration: 0.5, ease: [0.34,1.56,0.64,1] }}
                    >{ch}</motion.span>
                  ))}
                </div>
                {/* Bear row */}
                <motion.div className="flex gap-2 mt-2" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.9 }}>
                  {['🐻','👟','🐻','👟'].map((e,i) => (
                    <motion.span key={i} className="text-xl sm:text-2xl"
                      animate={{ y: [0,-6,0], rotate: [0,i%2?8:-8,0] }}
                      transition={{ duration: 1.6, delay: i*0.15, repeat: Infinity, ease: 'easeInOut' }}>
                      {e}
                    </motion.span>
                  ))}
                </motion.div>
              </div>

              <motion.p
                className="mt-4 text-brand-muted text-sm leading-relaxed max-w-md"
                initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
              >
                Manejamos nuestra propia red de entrega para garantizar que tus sneakers lleguen en perfectas condiciones, sin intermediarios y con seguimiento en tiempo real.
              </motion.p>
            </div>

            {/* Coverage zones */}
            <div>
              <motion.h3
                className="text-xs font-bold tracking-widest uppercase text-brand-muted flex items-center gap-2 mb-3"
                initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.35 }}
              >
                <MapPin className="w-3.5 h-3.5" /> Zonas cubiertas
              </motion.h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {COVERAGE_ZONES.map((zone, i) => (
                  <ZoneCard key={zone.name} zone={zone} index={i} inView={inView} />
                ))}
              </div>
            </div>

            {/* Shipping tiers */}
            <div>
              <motion.h3
                className="text-xs font-bold tracking-widest uppercase text-brand-muted flex items-center gap-2 mb-3"
                initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.55 }}
              >
                <Truck className="w-3.5 h-3.5" /> Costo de envío
              </motion.h3>
              <div className="flex flex-col gap-2">
                {SHIPPING_TIERS.map((tier, i) => (
                  <ShippingRow key={tier.label} tier={tier} index={i} inView={inView} />
                ))}
              </div>
            </div>

            {/* Perks */}
            <div className="flex flex-col gap-2">
              {[
                { text: 'Empaque premium con caja de zapatos sellada', emoji: '📦' },
                { text: 'Fotos del estado del producto antes de enviar', emoji: '📸' },
                { text: 'Seguimiento en tiempo real por WhatsApp', emoji: '📱' },
              ].map(({ text, emoji }, i) => (
                <motion.div
                  key={text}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.75 + i * 0.1, duration: 0.4 }}
                >
                  <CheckCircle className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-brand-muted">{text}</span>
                  <motion.span
                    className="text-base flex-shrink-0"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                  >{emoji}</motion.span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Map with 3D frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotateY: -8 }}
            animate={inView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22,1,0.36,1] }}
            style={{ perspective: 1000 }}
            className="relative"
          >
            {/* Glow behind map */}
            <div
              className="absolute inset-0 rounded-[var(--radius-xl)] pointer-events-none"
              style={{ boxShadow: '0 0 60px rgba(255,90,31,0.18), 0 0 120px rgba(212,175,55,0.1)' }}
              aria-hidden="true"
            />
            <div
              className="w-full rounded-[var(--radius-xl)] overflow-hidden border border-brand-border"
              style={{ height: '460px', background: '#0a0a0a' }}
            >
              <MapboxMap />
              {/* No-map fallback with bears */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-brand-elevated rounded-[var(--radius-xl)]"
                style={{ display: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? 'none' : 'flex' }}>
                <div className="flex gap-6">
                  {['🏔️','🐻','🏙️','👟','🌿'].map((e,i) => (
                    <motion.span key={i} className="text-4xl sm:text-5xl"
                      animate={{ y: [0,-12,0], rotate: [0,i%2?10:-10,0] }}
                      transition={{ duration: 2, delay: i*0.3, repeat: Infinity, ease: 'easeInOut' }}>
                      {e}
                    </motion.span>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-brand-muted text-sm font-mono tracking-widest">HIDALGO · CDMX · QUERÉTARO</p>
                  <p className="text-xs text-brand-border mt-1">Entrega en toda la zona centro</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
