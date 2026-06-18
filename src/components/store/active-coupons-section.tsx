'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { differenceInHours, differenceInDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Copy, Check, Tag, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Coupon {
  id: string
  code: string
  discount: number
  type: string
  expiresAt: Date | string | null
  description?: string | null
  minimumAmount?: number | null
}

interface ActiveCouponsSectionProps {
  coupons: Coupon[]
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = coupon.code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const discountLabel =
    coupon.type === 'PERCENTAGE'
      ? `${coupon.discount}% OFF`
      : coupon.type === 'FIXED'
      ? `$${coupon.discount} OFF`
      : `${coupon.discount} OFF`

  let expiryLabel: string | null = null
  if (coupon.expiresAt) {
    const exp = new Date(coupon.expiresAt)
    const hoursLeft = differenceInHours(exp, new Date())
    const daysLeft = differenceInDays(exp, new Date())
    if (hoursLeft <= 0) {
      expiryLabel = 'Expirado'
    } else if (hoursLeft < 24) {
      expiryLabel = `Expira en ${hoursLeft}h`
    } else if (daysLeft < 7) {
      expiryLabel = `Expira en ${daysLeft}d`
    } else {
      expiryLabel = `Hasta ${format(exp, "d 'de' MMMM", { locale: es })}`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="relative flex flex-col gap-4 p-5 rounded-[var(--radius-lg)] bg-brand-surface"
      style={{ border: '1px dashed rgba(255,90,31,0.4)' }}
    >
      {/* Notch decorations (left & right) */}
      <span
        aria-hidden="true"
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand-black border border-brand-border"
      />
      <span
        aria-hidden="true"
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand-black border border-brand-border"
      />

      {/* Top row: discount value + tag icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,90,31,0.12)' }}
          >
            <Tag className="w-4 h-4 text-brand-accent" />
          </div>
          <div>
            <span className="text-2xl font-display font-black text-white">{discountLabel}</span>
            {coupon.description && (
              <p className="text-xs text-brand-muted mt-0.5">{coupon.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Code row */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center justify-center h-10 rounded-lg bg-brand-elevated border border-brand-border">
          <span className="font-mono font-bold text-sm tracking-widest text-white uppercase">
            {coupon.code}
          </span>
        </div>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Código copiado' : `Copiar código ${coupon.code}`}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
            copied
              ? 'bg-brand-success text-white'
              : 'bg-brand-elevated border border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent'
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-4 h-4" />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Copy className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Footer: min amount + expiry */}
      <div className="flex items-center justify-between text-[11px] text-brand-muted">
        {coupon.minimumAmount && coupon.minimumAmount > 0 ? (
          <span>
            Compra mínima: ${coupon.minimumAmount.toLocaleString('es-MX')} MXN
          </span>
        ) : (
          <span>Sin compra mínima</span>
        )}
        {expiryLabel && (
          <span className="flex items-center gap-1 text-brand-accent font-medium">
            <Clock className="w-3 h-3" />
            {expiryLabel}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function ActiveCouponsSection({ coupons }: ActiveCouponsSectionProps) {
  if (coupons.length === 0) return null

  return (
    <section className="py-16 sm:py-24 bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-bold tracking-widest uppercase text-brand-accent">
              Ahorra ahora
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            CUPONES ACTIVOS
          </h2>
          <p className="mt-3 text-brand-muted text-sm max-w-md mx-auto">
            Aplica estos cupones en tu carrito y ahorra en tu próximo par.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-3">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      </div>
    </section>
  )
}
