'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Pencil, Archive, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteProduct } from '@/app/actions/products'
import toast from 'react-hot-toast'

interface ProductRow {
  id: string
  name: string
  slug: string
  brandId: string
  brandName: string
  categoryId: string
  categoryName: string
  price: number
  compareAtPrice: number | null
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  isFeatured: boolean
  isLimitedEdition: boolean
  primaryImage: string | null
  totalStock: number
  variantCount: number
  createdAt: string
}

interface SelectOption {
  id: string
  name: string
}

interface ProductsTableProps {
  products: ProductRow[]
  brands: SelectOption[]
  categories: SelectOption[]
  formatPrice: (n: number) => string
  formatDate: (d: Date | string) => string
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Activo', className: 'bg-brand-success/20 text-brand-success' },
  DRAFT: { label: 'Borrador', className: 'bg-brand-muted/20 text-brand-muted' },
  ARCHIVED: { label: 'Archivado', className: 'bg-brand-error/20 text-brand-error' },
}

const PAGE_SIZE = 20

export function ProductsTable({ products, brands, categories, formatPrice, formatDate }: ProductsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [archiving, setArchiving] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      const matchStatus = !statusFilter || p.status === statusFilter
      const matchBrand = !brandFilter || p.brandId === brandFilter
      const matchCategory = !categoryFilter || p.categoryId === categoryFilter
      return matchSearch && matchStatus && matchBrand && matchCategory
    })
  }, [products, search, statusFilter, brandFilter, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleFilterChange() {
    setPage(1)
  }

  async function handleArchive(id: string, name: string) {
    if (!confirm(`¿Archivar "${name}"? El producto dejará de ser visible en la tienda.`)) return
    setArchiving(id)
    const result = await deleteProduct(id)
    setArchiving(null)
    if (result.success) {
      toast.success('Producto archivado')
    } else {
      toast.error(result.error ?? 'Error al archivar')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, marca o slug..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); handleFilterChange() }}
            className="w-full pl-9 pr-4 py-2.5 bg-brand-elevated border border-brand-border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); handleFilterChange() }}
          className="px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="DRAFT">Borrador</option>
          <option value="ARCHIVED">Archivado</option>
        </select>
        <select
          value={brandFilter}
          onChange={(e) => { setBrandFilter(e.target.value); handleFilterChange() }}
          className="px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
        >
          <option value="">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); handleFilterChange() }}
          className="px-3 py-2.5 bg-brand-elevated border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-brand-muted">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        {(search || statusFilter || brandFilter || categoryFilter) ? ' (filtrados)' : ''}
      </p>

      {/* Table */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold w-12" />
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Producto</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Marca</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Precio</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Estado</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Stock</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Creado</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {paginated.map((product) => {
                const statusCfg = STATUS_LABELS[product.status]
                return (
                  <tr key={product.id} className="hover:bg-brand-border/20 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="w-10 h-10 rounded-lg bg-brand-border overflow-hidden shrink-0">
                        {product.primaryImage ? (
                          <Image
                            src={product.primaryImage}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-muted text-[10px]">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate max-w-[240px]">{product.name}</div>
                          <div className="text-xs text-brand-muted font-mono">{product.slug}</div>
                        </div>
                        {product.isFeatured && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-brand-gold/20 text-brand-gold rounded font-semibold">DEST</span>
                        )}
                        {product.isLimitedEdition && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-brand-accent/20 text-brand-accent rounded font-semibold">LTD</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-brand-muted">{product.brandName}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="text-sm font-mono font-semibold text-white">{formatPrice(product.price)}</div>
                      {product.compareAtPrice && (
                        <div className="text-xs font-mono text-brand-muted line-through">{formatPrice(product.compareAtPrice)}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
                        statusCfg.className
                      )}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={cn(
                        'font-mono text-sm font-semibold',
                        product.totalStock === 0 ? 'text-brand-error' :
                        product.totalStock < 5 ? 'text-yellow-400' :
                        'text-white'
                      )}>
                        {product.totalStock}
                      </span>
                      <div className="text-xs text-brand-muted">{product.variantCount} tallas</div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-brand-muted">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-border transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleArchive(product.id, product.name)}
                          disabled={archiving === product.id || product.status === 'ARCHIVED'}
                          className="p-1.5 rounded-lg text-brand-muted hover:text-brand-error hover:bg-brand-error/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Archivar"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-muted text-sm">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-brand-border flex items-center justify-between">
            <p className="text-xs text-brand-muted">
              Página {currentPage} de {totalPages} — {filtered.length} productos
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-elevated transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
                const p = start + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                      p === currentPage
                        ? 'bg-brand-accent text-white'
                        : 'text-brand-muted hover:text-white hover:bg-brand-elevated'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-brand-muted hover:text-white hover:bg-brand-elevated transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
