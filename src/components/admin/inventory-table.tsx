'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight, AlertTriangle, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InventoryRow {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  size: string
  sku: string
  isActive: boolean
  quantity: number
  reserved: number
  available: number
}

interface InventoryTableProps {
  rows: InventoryRow[]
}

const PAGE_SIZE = 50

export function InventoryTable({ rows }: InventoryTableProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        r.productName.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.size.toLowerCase().includes(q)
      const matchFilter =
        filter === 'all' ||
        (filter === 'out' && r.available === 0) ||
        (filter === 'low' && r.available > 0 && r.available < 3)
      return matchSearch && matchFilter
    })
  }, [rows, search, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const outCount = rows.filter((r) => r.available === 0).length
  const lowCount = rows.filter((r) => r.available > 0 && r.available < 3).length

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar producto, SKU o talla..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 bg-brand-elevated border border-brand-border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'Todo' },
            { key: 'low', label: `Stock bajo (${lowCount})` },
            { key: 'out', label: `Sin stock (${outCount})` },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1) }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                filter === f.key
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
        {filtered.length} variante{filtered.length !== 1 ? 's' : ''}
        {search || filter !== 'all' ? ' (filtradas)' : ''}
      </p>

      {/* Table */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Producto</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Talla</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold hidden sm:table-cell">SKU</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Cantidad</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Reservado</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Disponible</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {paginated.map((row) => {
                const isOut = row.available === 0
                const isLow = !isOut && row.available < 3
                return (
                  <tr key={row.variantId} className={cn('transition-colors', isOut ? 'bg-brand-error/5' : 'hover:bg-brand-border/10')}>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/products/${row.productId}`}
                        className="text-sm font-medium text-white hover:text-brand-accent transition-colors line-clamp-1"
                      >
                        {row.productName}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-7 bg-brand-border/40 rounded text-xs font-mono font-semibold text-white">
                        {row.size}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-xs font-mono text-brand-muted">{row.sku}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-sm text-white">
                      {row.quantity}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-sm text-brand-muted">
                      {row.reserved}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={cn(
                        'font-mono text-sm font-bold',
                        isOut ? 'text-brand-error' : isLow ? 'text-yellow-400' : 'text-brand-success'
                      )}>
                        {row.available}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-error/20 text-brand-error uppercase tracking-wide">
                          <AlertTriangle className="w-3 h-3" />
                          Sin stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/20 text-yellow-400 uppercase tracking-wide">
                          <Package className="w-3 h-3" />
                          Stock bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-success/20 text-brand-success uppercase tracking-wide">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-muted text-sm">
                    No se encontraron variantes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-brand-border flex items-center justify-between">
            <p className="text-xs text-brand-muted">
              Página {currentPage} de {totalPages} — {filtered.length} variantes
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
