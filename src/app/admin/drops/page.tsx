// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatDate, formatPrice } from '@/lib/utils'
import { CalendarDays, Users, Lock, Zap, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Drops' }
export const dynamic = 'force-dynamic'

const STATUS_CONFIG = {
  UPCOMING: { label: 'Próximo', className: 'bg-blue-500/20 text-blue-400', icon: Clock },
  LIVE: { label: 'Live', className: 'bg-brand-accent/20 text-brand-accent', icon: Zap },
  ENDED: { label: 'Finalizado', className: 'bg-brand-muted/20 text-brand-muted', icon: CheckCircle },
}

export default async function AdminDropsPage() {
  const drops = await db.drop.findMany({
    orderBy: { releaseDate: 'desc' },
    include: {
      _count: { select: { registrations: true } },
    },
  })

  const stats = {
    total: drops.length,
    live: drops.filter((d) => d.status === 'LIVE').length,
    upcoming: drops.filter((d) => d.status === 'UPCOMING').length,
    totalRegistrations: drops.reduce((sum, d) => sum + d._count.registrations, 0),
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Drops</h1>
          <p className="text-brand-muted text-sm mt-1">{drops.length} lanzamientos en total</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: CalendarDays, color: 'text-white' },
          { label: 'Live ahora', value: stats.live, icon: Zap, color: 'text-brand-accent' },
          { label: 'Próximos', value: stats.upcoming, icon: Clock, color: 'text-blue-400' },
          { label: 'Registrados', value: stats.totalRegistrations, icon: Users, color: 'text-brand-success' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-brand-elevated border border-brand-border rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-brand-muted">
                <Icon className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-medium">{stat.label}</span>
              </div>
              <p className={cn('text-2xl font-display font-bold', stat.color)}>{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Drops table */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Drop</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Estado</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Precio</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Registros</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Lanzamiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {drops.map((drop) => {
                const cfg = STATUS_CONFIG[drop.status]
                const Icon = cfg.icon
                return (
                  <tr key={drop.id} className="hover:bg-brand-border/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{drop.name}</span>
                            {drop.isExclusive && (
                              <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-brand-gold/20 text-brand-gold rounded font-semibold">
                                <Lock className="w-2.5 h-2.5" />EXC
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-brand-muted font-mono mt-0.5">{drop.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase', cfg.className)}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-sm text-white">
                      {drop.price ? formatPrice(Number(drop.price)) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 text-sm">
                        <Users className="w-3.5 h-3.5 text-brand-muted" />
                        <span className="font-mono font-semibold text-white">{drop._count.registrations}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-brand-muted whitespace-nowrap">
                      {formatDate(drop.releaseDate)}
                    </td>
                  </tr>
                )
              })}
              {drops.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-brand-muted text-sm">
                    No hay drops registrados todavía
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-brand-muted">
        Para crear o editar drops, usa el{' '}
        <Link href="/admin/dashboard" className="text-brand-accent hover:underline">dashboard</Link>{' '}
        o el panel de base de datos directamente.
      </p>
    </div>
  )
}
