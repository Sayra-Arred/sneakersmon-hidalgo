'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState, useMemo } from 'react'
import { Tag, Plus, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Globe, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface CouponRow {
  id: string
  code: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED' | 'SHIPPING' | 'REFERRAL' | 'VIP'
  value: number
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  isPublic: boolean
  startsAt: string | null
  expiresAt: string | null
  createdAt: string
  usageCount: number
}

interface CouponsStats {
  total: number
  active: number
  expired: number
  totalUses: number
}

interface CouponsClientProps {
  coupons: CouponRow[]
  stats: CouponsStats
  formatDate: (d: Date | string) => string
  formatPrice: (n: number) => string
}

const TYPE_LABELS: Record<CouponRow['type'], string> = {
  PERCENTAGE: 'Porcentaje',
  FIXED: 'Fijo',
  SHIPPING: 'Envío gratis',
  REFERRAL: 'Referido',
  VIP: 'VIP',
}

const TYPE_COLORS: Record<CouponRow['type'], string> = {
  PERCENTAGE: 'bg-blue-500/20 text-blue-400',
  FIXED: 'bg-brand-accent/20 text-brand-accent',
  SHIPPING: 'bg-green-500/20 text-green-400',
  REFERRAL: 'bg-purple-500/20 text-purple-400',
  VIP: 'bg-brand-gold/20 text-brand-gold',
}

const PAGE_SIZE = 25

export function CouponsClient({ coupons, stats, formatDate, formatPrice }: CouponsClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const now = new Date()

  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch = !q || c.code.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
      const matchActive =
        filterActive === 'all' ||
        (filterActive === 'active' && c.isActive) ||
        (filterActive === 'inactive' && !c.isActive)
      return matchSearch && matchActive
    })
  }, [coupons, search, filterActive])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  async function toggleActive(coupon: CouponRow) {
    setTogglingId(coupon.id)
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      if (!res.ok) throw new Error()
      toast.success(coupon.isActive ? 'Cupón desactivado' : 'Cupón activado')
      router.refresh()
    } catch {
      toast.error('Error al actualizar el cupón')
    } finally {
      setTogglingId(null)
    }
  }

  function formatValue(coupon: CouponRow) {
    if (coupon.type === 'PERCENTAGE') return `${coupon.value}%`
    if (coupon.type === 'SHIPPING') return 'Gratis'
    return formatPrice(coupon.value)
  }

  function isExpired(coupon: CouponRow) {
    return !!(coupon.expiresAt && new Date(coupon.expiresAt) < now)
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Cupones</h1>
          <p className="text-brand-muted text-sm mt-1">{coupons.length} cupones en total</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Activos', value: stats.active, color: 'text-brand-success' },
          { label: 'Expirados', value: stats.expired, color: 'text-brand-error' },
          { label: 'Usos totales', value: stats.totalUses, color: 'text-brand-accent' },
        ].map((s) => (
          <div key={s.label} className="bg-brand-elevated border border-brand-border rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2 text-brand-muted">
              <Tag className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-medium">{s.label}</span>
            </div>
            <p className={cn('text-2xl font-display font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar código o descripción..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 bg-brand-elevated border border-brand-border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'Todos' },
            { key: 'active', label: 'Activos' },
            { key: 'inactive', label: 'Inactivos' },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilterActive(f.key); setPage(1) }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                filterActive === f.key
                  ? 'bg-brand-accent text-white'
                  : 'bg-brand-elevated border border-brand-border text-brand-muted hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-brand-muted">
        {filtered.length} cupón{filtered.length !== 1 ? 'es' : ''}
        {(search || filterActive !== 'all') ? ' (filtrados)' : ''}
      </p>

      {/* Table */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Código</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Tipo</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Valor</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Usos</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Visibilidad</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Expira</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {paginated.map((coupon) => {
                const expired = isExpired(coupon)
                return (
                  <tr key={coupon.id} className={cn('transition-colors', expired ? 'opacity-60' : 'hover:bg-brand-border/10')}>
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-sm text-white tracking-wider">{coupon.code}</div>
                      {coupon.description && (
                        <div className="text-xs text-brand-muted mt-0.5 max-w-[200px] truncate">{coupon.description}</div>
                      )}
                      {coupon.minOrder && (
                        <div className="text-[10px] text-brand-muted mt-0.5">
                          Mín. {formatPrice(coupon.minOrder)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide', TYPE_COLORS[coupon.type])}>
                        {TYPE_LABELS[coupon.type]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-white text-sm">
                      {formatValue(coupon)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-mono text-sm text-white">{coupon.usageCount}</span>
                      {coupon.maxUses && (
                        <span className="text-brand-muted text-xs"> / {coupon.maxUses}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {coupon.isPublic ? (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-success">
                          <Globe className="w-3.5 h-3.5" />Público
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-muted">
                          <Lock className="w-3.5 h-3.5" />Privado
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-brand-muted whitespace-nowrap">
                      {coupon.expiresAt ? (
                        <span className={expired ? 'text-brand-error' : ''}>
                          {formatDate(coupon.expiresAt)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {expired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-error/20 text-brand-error uppercase">
                          Expirado
                        </span>
                      ) : coupon.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-success/20 text-brand-success uppercase">
                          <CheckCircle className="w-3 h-3" />Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-muted/20 text-brand-muted uppercase">
                          <XCircle className="w-3 h-3" />Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!expired && (
                        <button
                          onClick={() => toggleActive(coupon)}
                          disabled={togglingId === coupon.id}
                          className={cn(
                            'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40',
                            coupon.isActive
                              ? 'bg-brand-error/10 text-brand-error hover:bg-brand-error/20'
                              : 'bg-brand-success/10 text-brand-success hover:bg-brand-success/20'
                          )}
                        >
                          {coupon.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-brand-muted text-sm">
                    No se encontraron cupones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-brand-border flex items-center justify-between">
            <p className="text-xs text-brand-muted">
              Página {currentPage} de {totalPages} — {filtered.length} cupones
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
