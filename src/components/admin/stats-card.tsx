// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  format?: 'currency' | 'number' | 'percent'
  className?: string
}

export function StatsCard({
  label,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  format = 'number',
  className,
}: StatsCardProps) {
  const formatted =
    typeof value === 'number'
      ? format === 'currency'
        ? formatPrice(value)
        : format === 'percent'
        ? `${value.toFixed(1)}%`
        : value.toLocaleString('es-MX')
      : value

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div
      className={cn(
        'bg-brand-elevated border border-brand-border rounded-xl p-5 space-y-4',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-brand-muted font-medium">{label}</p>
        <div className="w-9 h-9 rounded-lg bg-brand-accent/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-accent" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-display font-bold text-white">{formatted}</p>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend === 'up' && 'text-brand-success',
              trend === 'down' && 'text-brand-error',
              trend === 'neutral' && 'text-brand-muted'
            )}
          >
            <TrendIcon className="w-3.5 h-3.5" />
            <span>
              {change > 0 ? '+' : ''}
              {change.toFixed(1)}% vs mes anterior
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
