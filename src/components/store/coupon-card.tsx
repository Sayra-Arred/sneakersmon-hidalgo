'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState } from 'react'
import { formatDate, formatPrice } from '@/lib/utils'
import { Check, Copy, Tag, Clock, ShoppingBag, Zap, Crown, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

const COUPON_TYPE_LABELS: Record<string, string> = {
  PERCENTAGE: 'Porcentaje de descuento',
  FIXED: 'Descuento fijo',
  SHIPPING: 'Envío gratis',
  REFERRAL: 'Referido',
  VIP: 'Cliente VIP',
}

const COUPON_TYPE_ICONS: Record<string, React.ReactNode> = {
  PERCENTAGE: <Tag className="w-4 h-4" />,
  FIXED: <ShoppingBag className="w-4 h-4" />,
  SHIPPING: <Truck className="w-4 h-4" />,
  REFERRAL: <Zap className="w-4 h-4" />,
  VIP: <Crown className="w-4 h-4" />,
}

const COUPON_TYPE_COLORS: Record<string, string> = {
  PERCENTAGE: 'text-brand-accent border-brand-accent/30',
  FIXED: 'text-brand-success border-brand-success/30',
  SHIPPING: 'text-blue-400 border-blue-400/30',
  REFERRAL: 'text-purple-400 border-purple-400/30',
  VIP: 'text-brand-gold border-brand-gold/30',
}

interface CouponCardProps {
  code: string
  description?: string
  type: string
  value: number
  minOrder?: number
  expiresAt?: Date
  usedCount: number
  maxUses?: number
}

export function CouponCard({
  code,
  description,
  type,
  value,
  minOrder,
  expiresAt,
  usedCount,
  maxUses,
}: CouponCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function formatValue(): string {
    if (type === 'PERCENTAGE') return `-${value}%`
    if (type === 'FIXED') return `-${formatPrice(value)}`
    if (type === 'SHIPPING') return 'Envío gratis'
    return `-${value}`
  }

  const colorClass = COUPON_TYPE_COLORS[type] ?? COUPON_TYPE_COLORS.PERCENTAGE
  const usesLeft = maxUses ? maxUses - usedCount : null
  const isLowUses = usesLeft !== null && usesLeft <= 10

  return (
    <div className="group relative bg-brand-elevated border border-brand-border rounded-2xl overflow-hidden hover:border-brand-muted/40 transition-all duration-300">
      {/* Top accent line */}
      <div
        className={cn(
          'absolute top-0 inset-x-0 h-0.5 opacity-70',
          type === 'VIP' ? 'bg-brand-gold' :
          type === 'SHIPPING' ? 'bg-blue-400' :
          type === 'REFERRAL' ? 'bg-purple-400' :
          type === 'FIXED' ? 'bg-brand-success' :
          'bg-brand-accent'
        )}
      />

      <div className="p-6 space-y-5">
        {/* Type badge + value */}
        <div className="flex items-start justify-between gap-3">
          <div className={cn('flex items-center gap-2 text-xs font-semibold tracking-wide uppercase border px-2.5 py-1 rounded-full', colorClass)}>
            {COUPON_TYPE_ICONS[type]}
            {COUPON_TYPE_LABELS[type] ?? type}
          </div>
          <span className={cn('font-display font-black text-2xl tracking-tight shrink-0', colorClass.split(' ')[0])}>
            {formatValue()}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-brand-muted text-sm leading-relaxed line-clamp-2">{description}</p>
        )}

        {/* Code copy area */}
        <button
          onClick={handleCopy}
          className={cn(
            'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-200',
            copied
              ? 'border-brand-success bg-brand-success/10'
              : 'border-brand-border bg-brand-surface hover:border-brand-muted/50 hover:bg-brand-elevated'
          )}
          aria-label={`Copiar código ${code}`}
        >
          <span className={cn(
            'font-mono font-bold text-lg tracking-widest',
            copied ? 'text-brand-success' : 'text-white'
          )}>
            {code}
          </span>
          <span className={cn(
            'flex items-center gap-1.5 text-xs font-semibold shrink-0 transition-colors',
            copied ? 'text-brand-success' : 'text-brand-muted'
          )}>
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </span>
        </button>

        {/* Details */}
        <div className="space-y-2 pt-1">
          {minOrder && (
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Pedido mínimo: <span className="text-white font-medium">{formatPrice(minOrder)}</span></span>
            </div>
          )}

          {expiresAt && (
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>
                Válido hasta:{' '}
                <span className="text-white font-medium">
                  {formatDate(expiresAt)}
                </span>
              </span>
            </div>
          )}

          {usesLeft !== null && (
            <div className={cn('flex items-center gap-2 text-xs', isLowUses ? 'text-brand-error' : 'text-brand-muted')}>
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  isLowUses ? 'bg-brand-error animate-pulse' : 'bg-brand-muted'
                )}
              />
              {isLowUses
                ? `¡Solo quedan ${usesLeft} usos!`
                : `${usesLeft.toLocaleString('es-MX')} usos disponibles`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
