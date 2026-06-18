'use client'

import { cn } from '@/lib/utils'

interface StockMonitorProps {
  available: number
}

export function StockMonitor({ available }: StockMonitorProps) {
  if (available <= 0) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-error/15 border border-brand-error/30">
        <span className="w-2 h-2 rounded-full bg-brand-error" />
        <span className="text-xs font-black uppercase tracking-widest text-brand-error">
          Agotado
        </span>
      </div>
    )
  }

  if (available <= 3) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30">
        <span
          className={cn(
            'w-2 h-2 rounded-full bg-brand-gold',
            'animate-pulse'
          )}
        />
        <span className="text-xs font-black uppercase tracking-widest text-brand-gold">
          Últimas {available} {available === 1 ? 'par' : 'pares'}
        </span>
      </div>
    )
  }

  if (available <= 10) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-xs font-black uppercase tracking-widest text-amber-500">
          Pocas unidades
        </span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-success/15 border border-brand-success/30">
      <span className="w-2 h-2 rounded-full bg-brand-success" />
      <span className="text-xs font-black uppercase tracking-widest text-brand-success">
        En stock
      </span>
    </div>
  )
}
