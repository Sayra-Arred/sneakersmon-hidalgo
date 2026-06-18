// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { formatDateTime } from '@/lib/utils'
import { Shield, User, Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'Registro de auditoría' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ entity?: string; q?: string; page?: string }>
}

const PAGE_SIZE = 50

export default async function AdminAuditLogsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: Record<string, unknown> = {}
  if (sp.entity) where.entity = sp.entity
  if (sp.q) {
    where.OR = [
      { action: { contains: sp.q, mode: 'insensitive' } },
      { entity: { contains: sp.q, mode: 'insensitive' } },
      { entityId: { contains: sp.q, mode: 'insensitive' } },
    ]
  }

  const [logs, total] = await Promise.all([
    db.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    db.adminAuditLog.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const entities = await db.adminAuditLog.findMany({
    distinct: ['entity'],
    select: { entity: true },
    orderBy: { entity: 'asc' },
  })

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { entity: sp.entity, q: sp.q, page: '1', ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return `/admin/audit-logs${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-brand-accent" />
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Registro de auditoría</h1>
          <p className="text-brand-muted text-sm mt-0.5">{total} eventos registrados</p>
        </div>
      </div>

      {/* Filters */}
      <form method="get" action="/admin/audit-logs" className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48">
          <label className="block text-xs text-brand-muted mb-1.5 font-medium uppercase tracking-wider">Buscar</label>
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Acción, entidad, ID..."
            className="w-full h-9 rounded-lg bg-brand-elevated border border-brand-border px-3 text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-brand-muted mb-1.5 font-medium uppercase tracking-wider">Entidad</label>
          <select
            name="entity"
            defaultValue={sp.entity ?? ''}
            className="h-9 rounded-lg bg-brand-elevated border border-brand-border px-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
          >
            <option value="">Todas</option>
            {entities.map((e) => (
              <option key={e.entity} value={e.entity}>{e.entity}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-9 px-4 rounded-lg bg-brand-accent text-white text-sm font-semibold hover:bg-[#e04d18] transition-colors"
        >
          Filtrar
        </button>
        {(sp.q || sp.entity) && (
          <a
            href="/admin/audit-logs"
            className="h-9 px-4 rounded-lg border border-brand-border text-brand-muted text-sm font-semibold hover:text-white flex items-center transition-colors"
          >
            Limpiar
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Acción</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Entidad</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Admin</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold hidden sm:table-cell">IP</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-border/10 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-white">{log.entity}</div>
                    {log.entityId && (
                      <div className="text-xs text-brand-muted font-mono">{log.entityId.slice(0, 12)}…</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {log.user ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-border flex items-center justify-center">
                          <User className="w-3 h-3 text-brand-muted" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">{log.user.name ?? '—'}</div>
                          <div className="text-[10px] text-brand-muted">{log.user.email}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-brand-muted text-xs">Sistema</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-xs font-mono text-brand-muted">{log.ip ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 text-xs text-brand-muted whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(log.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-brand-muted text-sm">
                    No hay eventos de auditoría registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-brand-border flex items-center justify-between gap-4">
            <p className="text-xs text-brand-muted">
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} de {total} eventos
            </p>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <a href={buildUrl({ page: String(page - 1) })} className="h-7 px-3 text-xs rounded-md text-brand-muted hover:text-white hover:bg-brand-border transition-colors flex items-center">
                  ← Anterior
                </a>
              )}
              {page < totalPages && (
                <a href={buildUrl({ page: String(page + 1) })} className="h-7 px-3 text-xs rounded-md text-brand-muted hover:text-white hover:bg-brand-border transition-colors flex items-center">
                  Siguiente →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
