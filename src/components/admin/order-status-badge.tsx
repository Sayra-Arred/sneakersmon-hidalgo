// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  PENDING:    { label: 'Pendiente',   className: 'bg-brand-muted/20 text-brand-muted',    dot: 'bg-brand-muted' },
  CONFIRMED:  { label: 'Confirmado',  className: 'bg-blue-500/20 text-blue-400',           dot: 'bg-blue-400' },
  PROCESSING: { label: 'Procesando',  className: 'bg-yellow-500/20 text-yellow-400',       dot: 'bg-yellow-400 animate-pulse' },
  SHIPPED:    { label: 'Enviado',     className: 'bg-purple-500/20 text-purple-400',       dot: 'bg-purple-400' },
  DELIVERED:  { label: 'Entregado',   className: 'bg-brand-success/20 text-brand-success', dot: 'bg-brand-success' },
  CANCELLED:  { label: 'Cancelado',   className: 'bg-brand-error/20 text-brand-error',     dot: 'bg-brand-error' },
  REFUNDED:   { label: 'Reembolsado', className: 'bg-orange-500/20 text-orange-400',       dot: 'bg-orange-400' },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  showDot?: boolean
}

export function OrderStatusBadge({ status, showDot = true }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
        config.className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />}
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
