// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatDate, formatPrice, getInitials } from '@/lib/utils'
import { Users, ShoppingBag, DollarSign, UserCheck, ExternalLink } from 'lucide-react'

export const metadata: Metadata = { title: 'Usuarios' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; status?: string; page?: string }>
}

const PAGE_SIZE = 50

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', className: 'bg-brand-gold/20 text-brand-gold' },
  ADMIN:       { label: 'Admin',       className: 'bg-brand-accent/20 text-brand-accent' },
  USER:        { label: 'Usuario',     className: 'bg-brand-muted/20 text-brand-muted' },
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: Record<string, unknown> = {}

  if (sp.role && ['USER', 'ADMIN', 'SUPER_ADMIN'].includes(sp.role)) {
    where.role = sp.role
  }

  if (sp.status === 'active') where.isActive = true
  if (sp.status === 'inactive') where.isActive = false

  if (sp.q) {
    const q = sp.q.trim()
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [users, total, roleCounts] = await Promise.all([
    db.user.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          where: { paymentStatus: 'PAID' },
          select: { total: true },
        },
        _count: { select: { orders: true } },
      },
    }),
    db.user.count({ where }),
    db.user.groupBy({ by: ['role'], _count: true }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { q: sp.q, role: sp.role, status: sp.status, page: '1', ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    return `/admin/users?${params.toString()}`
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Usuarios</h1>
        <p className="text-brand-muted text-sm mt-1">{total} usuarios{sp.q || sp.role || sp.status ? ' (filtrados)' : ' registrados'}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-brand-muted mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Total</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">{roleCounts.reduce((s, r) => s + r._count, 0)}</p>
        </div>
        <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-brand-muted mb-1">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Admins</span>
          </div>
          <p className="text-2xl font-display font-bold text-brand-accent">
            {(roleCounts.find((r) => r.role === 'ADMIN')?._count ?? 0) +
             (roleCounts.find((r) => r.role === 'SUPER_ADMIN')?._count ?? 0)}
          </p>
        </div>
        <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-brand-muted mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Con pedidos</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {await db.user.count({ where: { orders: { some: {} } } })}
          </p>
        </div>
        <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-brand-muted mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Inactivos</span>
          </div>
          <p className="text-2xl font-display font-bold text-brand-error">
            {await db.user.count({ where: { isActive: false } })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <form method="get" action="/admin/users" className="flex flex-wrap items-end gap-3 flex-1">
          {sp.role && <input type="hidden" name="role" value={sp.role} />}
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-brand-muted mb-1.5 font-medium uppercase tracking-wider">Buscar</label>
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="Email o nombre..."
              className="w-full h-9 rounded-lg bg-brand-elevated border border-brand-border px-3 text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1.5 font-medium uppercase tracking-wider">Rol</label>
            <select
              name="role"
              defaultValue={sp.role ?? ''}
              className="h-9 rounded-lg bg-brand-elevated border border-brand-border px-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
            >
              <option value="">Todos los roles</option>
              <option value="USER">Usuario</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1.5 font-medium uppercase tracking-wider">Estado</label>
            <select
              name="status"
              defaultValue={sp.status ?? ''}
              className="h-9 rounded-lg bg-brand-elevated border border-brand-border px-3 text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
            >
              <option value="">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <button type="submit" className="h-9 px-4 rounded-lg bg-brand-accent text-white text-sm font-semibold hover:bg-[#e04d18] transition-colors">
            Filtrar
          </button>
          {(sp.q || sp.role || sp.status) && (
            <Link href="/admin/users" className="h-9 px-4 rounded-lg border border-brand-border text-brand-muted text-sm font-semibold hover:text-white hover:border-brand-muted transition-colors flex items-center">
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Usuario</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Rol</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Pedidos</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Total gastado</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Estado</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Registro</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {users.map((user) => {
                const totalSpent = user.orders.reduce((sum, o) => sum + Number(o.total), 0)
                const roleConfig = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.USER
                return (
                  <tr key={user.id} className="hover:bg-brand-border/20 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center text-brand-accent text-xs font-bold shrink-0">
                          {getInitials(user.name ?? user.email)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">{user.name ?? '—'}</div>
                          <div className="text-xs text-brand-muted truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleConfig.className}`}>
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-sm text-white">
                      {user._count.orders}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-sm text-white">
                      {totalSpent > 0 ? formatPrice(totalSpent) : <span className="text-brand-muted">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        user.isActive
                          ? 'bg-brand-success/15 text-brand-success'
                          : 'bg-brand-error/15 text-brand-error'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-brand-success' : 'bg-brand-error'}`} />
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-brand-muted whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders?q=${encodeURIComponent(user.email)}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-muted hover:text-white"
                        title="Ver pedidos"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-brand-muted text-sm">
                    No se encontraron usuarios con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-brand-border flex items-center justify-between gap-4">
            <p className="text-xs text-brand-muted">
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}
            </p>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <Link href={buildUrl({ page: String(page - 1) })} className="h-7 px-3 text-xs rounded-md text-brand-muted hover:text-white hover:bg-brand-border transition-colors flex items-center">
                  ← Anterior
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`w-7 h-7 text-xs rounded-md flex items-center justify-center transition-colors ${
                    p === page ? 'bg-brand-accent text-white font-semibold' : 'text-brand-muted hover:text-white hover:bg-brand-border'
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link href={buildUrl({ page: String(page + 1) })} className="h-7 px-3 text-xs rounded-md text-brand-muted hover:text-white hover:bg-brand-border transition-colors flex items-center">
                  Siguiente →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
