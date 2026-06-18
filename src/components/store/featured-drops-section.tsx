'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns'
import { Zap, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Drop {
  id: string
  name: string
  releaseDate: Date | string
  status: string
  imageUrl?: string | null
  description?: string | null
  price?: number | null
}

interface FeaturedDropsSectionProps {
  drops: Drop[]
}

function useCountdown(targetDate: Date | string) {
  const target = new Date(targetDate)
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, differenceInSeconds(target, new Date()))
  )

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft(Math.max(0, differenceInSeconds(target, new Date())))
    }, 1000)
    return () => clearInterval(id)
  }, [target, secondsLeft])

  const duration = intervalToDuration({ start: 0, end: secondsLeft * 1000 })

  return {
    days: String(duration.days ?? 0).padStart(2, '0'),
    hours: String(duration.hours ?? 0).padStart(2, '0'),
    minutes: String(duration.minutes ?? 0).padStart(2, '0'),
    seconds: String(duration.seconds ?? 0).padStart(2, '0'),
    isExpired: secondsLeft <= 0,
  }
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono font-bold text-xl sm:text-2xl text-white tabular-nums">
        {value}
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-widest text-brand-muted">
        {label}
      </span>
    </div>
  )
}

function DropCard({ drop, index }: { drop: Drop; index: number }) {
  const countdown = useCountdown(drop.releaseDate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col rounded-[var(--radius-lg)] overflow-hidden border border-brand-border group"
      style={{ background: '#0a0a0a' }}
    >
      {/* Image / hero area */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{
          background: drop.imageUrl
            ? `url(${drop.imageUrl}) center/cover`
            : 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Status chip */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-accent text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            PRÓXIMO DROP
          </span>
        </div>

        {/* Drop name over image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display font-black text-lg sm:text-xl text-white leading-tight line-clamp-2">
            {drop.name}
          </h3>
          {drop.description && (
            <p className="text-xs text-white/70 mt-1 line-clamp-2">{drop.description}</p>
          )}
        </div>

        {/* No image placeholder */}
        {!drop.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Zap className="w-24 h-24 text-white" />
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="p-4 flex flex-col gap-4">
        {/* Countdown */}
        {countdown.isExpired ? (
          <div className="flex items-center gap-2 text-brand-accent">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold">¡Disponible ahora!</span>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted mb-2 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Lanzamiento en
            </p>
            <div className="flex items-center gap-3">
              <CountdownUnit value={countdown.days} label="Días" />
              <span className="text-brand-muted font-bold text-lg">:</span>
              <CountdownUnit value={countdown.hours} label="Hrs" />
              <span className="text-brand-muted font-bold text-lg">:</span>
              <CountdownUnit value={countdown.minutes} label="Min" />
              <span className="text-brand-muted font-bold text-lg">:</span>
              <CountdownUnit value={countdown.seconds} label="Seg" />
            </div>
          </div>
        )}

        {/* Price */}
        {drop.price && (
          <p className="text-sm text-brand-muted">
            Desde{' '}
            <span className="text-white font-bold">
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(drop.price)}
            </span>
          </p>
        )}

        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => {
            // Registration logic placeholder
          }}
          aria-label={`Registrarme para el drop: ${drop.name}`}
        >
          REGISTRARME
        </Button>
      </div>
    </motion.div>
  )
}

const PLACEHOLDER_DROPS = [
  { emoji: '👟', brand: 'NIKE', name: 'Air Max — Edición Especial' },
  { emoji: '🐻', brand: 'JORDAN', name: 'Retro High OG — Drop Limitado' },
  { emoji: '👟', brand: 'ADIDAS', name: 'Yeezy 350 — Lanzamiento Próximo' },
  { emoji: '🐻', brand: 'NEW BALANCE', name: '990v6 — Coming Soon' },
  { emoji: '👟', brand: 'CONVERSE', name: 'Chuck 70 — Colección 2026' },
  { emoji: '🐻', brand: 'PUMA', name: 'Speedcat OG — Edición Limitada' },
]

function PlaceholderDropCard({ item, index }: { item: typeof PLACEHOLDER_DROPS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-brand-elevated border border-brand-border rounded-[var(--radius-xl)] overflow-hidden"
    >
      {/* top banner */}
      <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #FF5A1F, #D4AF37)' }} />
      {/* badge */}
      <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
        style={{ background: 'rgba(255,90,31,0.15)', color: '#FF5A1F', border: '1px solid rgba(255,90,31,0.35)' }}>
        PRÓXIMAMENTE
      </div>
      {/* image area */}
      <div className="aspect-square flex flex-col items-center justify-center gap-3 px-6"
        style={{ background: 'linear-gradient(135deg, rgba(255,90,31,0.06) 0%, rgba(212,175,55,0.04) 100%)' }}>
        <motion.span
          className="text-6xl sm:text-7xl select-none"
          animate={{ y: [0, -12, 0], rotate: [0, index % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: 2 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {item.emoji}
        </motion.span>
        <span className="text-[10px] font-black tracking-[0.3em] text-brand-muted uppercase">{item.brand}</span>
      </div>
      {/* info */}
      <div className="p-5">
        <p className="font-display font-black text-white text-sm sm:text-base leading-tight mb-3">{item.name}</p>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-3.5 h-3.5 text-brand-accent" />
          <span className="text-xs text-brand-muted tracking-wide">Fecha por anunciar</span>
        </div>
        <div className="w-full rounded-lg py-2.5 text-center text-xs font-bold tracking-widest uppercase text-brand-muted border border-brand-border"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          NOTIFICARME
        </div>
      </div>
    </motion.div>
  )
}

export function FeaturedDropsSection({ drops }: FeaturedDropsSectionProps) {
  const hasDrops = drops.length > 0

  return (
    <section className="py-16 sm:py-24 bg-brand-black border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-brand-accent fill-brand-accent" />
            <span className="text-xs font-bold tracking-widest uppercase text-brand-accent">
              Ediciones Limitadas
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            DROPS EXCLUSIVOS
          </h2>
        </div>

        {/* Grid */}
        {hasDrops ? (
          <div className={cn(
            'grid gap-4 lg:gap-6',
            drops.length === 1 && 'grid-cols-1 max-w-md',
            drops.length === 2 && 'grid-cols-1 sm:grid-cols-2',
            drops.length >= 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}>
            {drops.map((drop, i) => (
              <DropCard key={drop.id} drop={drop} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {PLACEHOLDER_DROPS.map((item, i) => (
              <PlaceholderDropCard key={i} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
