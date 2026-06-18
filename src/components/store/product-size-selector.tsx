'use client'

import { cn } from '@/lib/utils'
import { getAvailableStock } from '@/lib/utils'
import type { ProductVariant } from '@/types'

interface ProductSizeSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onSelect: (variant: ProductVariant) => void
}

export function ProductSizeSelector({
  variants,
  selectedVariant,
  onSelect,
}: ProductSizeSelectorProps) {
  const active = variants.filter((v) => v.isActive)

  // Sort numerically when possible (shoe sizes), else alphabetically
  const sorted = [...active].sort((a, b) => {
    const na = parseFloat(a.size)
    const nb = parseFloat(b.size)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.size.localeCompare(b.size)
  })

  if (sorted.length === 0) {
    return (
      <p className="text-brand-muted text-sm">No hay tallas disponibles.</p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white uppercase tracking-wide">
          Talla
        </span>
        {selectedVariant && (
          <span className="text-sm text-brand-accent font-medium">
            US {selectedVariant.size}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {sorted.map((variant) => {
          const available = getAvailableStock(variant.inventory)
          const isOOS = available <= 0
          const isSelected = selectedVariant?.id === variant.id

          return (
            <button
              key={variant.id}
              onClick={() => !isOOS && onSelect(variant)}
              disabled={isOOS}
              aria-label={`Talla US ${variant.size}${isOOS ? ' — Agotado' : ''}`}
              aria-pressed={isSelected}
              className={cn(
                'relative h-11 rounded-lg border text-sm font-semibold transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                isOOS
                  ? 'border-brand-border text-brand-border cursor-not-allowed bg-transparent'
                  : isSelected
                  ? 'border-brand-accent bg-brand-accent text-white shadow-[0_0_16px_rgba(255,90,31,0.4)]'
                  : 'border-brand-border text-white hover:border-brand-accent hover:text-brand-accent bg-transparent'
              )}
            >
              {/* Diagonal slash for OOS */}
              {isOOS && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
                >
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-px bg-brand-border rotate-45" />
                </span>
              )}
              {variant.size}
              {/* Low stock dot */}
              {!isOOS && available <= 3 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* OOS legend */}
      <p className="text-xs text-brand-muted">
        Las tallas con{' '}
        <span className="line-through">—</span>{' '}
        están agotadas.{' '}
        <span className="text-brand-gold">·</span>{' '}
        indica últimas unidades.
      </p>
    </div>
  )
}
