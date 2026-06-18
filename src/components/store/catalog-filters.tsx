'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface CatalogFiltersProps {
  categories: FilterOption[]
  brands: FilterOption[]
  sizes: FilterOption[]
  genders: FilterOption[]
  priceRange: { min: number; max: number }
  appliedFilters: {
    category?: string
    brand?: string
    size?: string
    gender?: string
    minPrice?: string
    maxPrice?: string
  }
}

// ─── Collapse section ─────────────────────────────────────────────────────────

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-brand-border py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-sm font-semibold text-white uppercase tracking-wide"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-brand-muted transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CatalogFilters({
  categories,
  brands,
  sizes,
  genders,
  priceRange,
  appliedFilters,
}: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    const sort = searchParams.get('sort')
    if (sort) params.set('sort', sort)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const hasActiveFilters =
    !!appliedFilters.category ||
    !!appliedFilters.brand ||
    !!appliedFilters.size ||
    !!appliedFilters.gender ||
    !!appliedFilters.minPrice ||
    !!appliedFilters.maxPrice

  // Price inputs
  const [localMin, setLocalMin] = useState(appliedFilters.minPrice ?? '')
  const [localMax, setLocalMax] = useState(appliedFilters.maxPrice ?? '')

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (localMin) params.set('minPrice', localMin)
    else params.delete('minPrice')
    if (localMax) params.set('maxPrice', localMax)
    else params.delete('maxPrice')
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const filtersBody = (
    <div
      className={cn(
        'flex flex-col',
        isPending && 'opacity-60 pointer-events-none transition-opacity'
      )}
    >
      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1.5 text-xs text-brand-accent hover:underline mb-1 self-start"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar filtros
        </button>
      )}

      {/* Gender */}
      {genders.length > 0 && (
        <FilterSection title="Género">
          <div className="flex flex-wrap gap-2">
            {genders.map((g) => (
              <button
                key={g.value}
                onClick={() =>
                  setFilter(
                    'gender',
                    appliedFilters.gender === g.value ? null : g.value
                  )
                }
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150',
                  appliedFilters.gender === g.value
                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                    : 'border-brand-border text-brand-muted hover:border-brand-muted hover:text-white'
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="Categoría">
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.value}>
                <button
                  onClick={() =>
                    setFilter(
                      'category',
                      appliedFilters.category === cat.value ? null : cat.value
                    )
                  }
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-all duration-150',
                    appliedFilters.category === cat.value
                      ? 'bg-brand-accent/10 text-brand-accent font-semibold'
                      : 'text-brand-muted hover:text-white hover:bg-brand-elevated'
                  )}
                >
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span className="text-xs text-brand-border font-mono">
                      {cat.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <FilterSection title="Marca">
          <ul className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
            {brands.map((brand) => (
              <li key={brand.value}>
                <button
                  onClick={() =>
                    setFilter(
                      'brand',
                      appliedFilters.brand === brand.value ? null : brand.value
                    )
                  }
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-all duration-150',
                    appliedFilters.brand === brand.value
                      ? 'bg-brand-accent/10 text-brand-accent font-semibold'
                      : 'text-brand-muted hover:text-white hover:bg-brand-elevated'
                  )}
                >
                  <span>{brand.label}</span>
                  {brand.count !== undefined && (
                    <span className="text-xs text-brand-border font-mono">
                      {brand.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Size */}
      {sizes.length > 0 && (
        <FilterSection title="Talla (US)" defaultOpen={false}>
          <div className="grid grid-cols-4 gap-1.5">
            {sizes.map((size) => (
              <button
                key={size.value}
                onClick={() =>
                  setFilter(
                    'size',
                    appliedFilters.size === size.value ? null : size.value
                  )
                }
                className={cn(
                  'h-9 rounded-lg border text-xs font-semibold transition-all duration-150',
                  appliedFilters.size === size.value
                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                    : 'border-brand-border text-brand-muted hover:border-brand-muted hover:text-white'
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price range */}
      <FilterSection title="Precio" defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label
                htmlFor="min-price"
                className="text-[10px] text-brand-muted uppercase tracking-wide mb-1 block"
              >
                Mínimo
              </label>
              <input
                id="min-price"
                type="number"
                min={priceRange.min}
                max={priceRange.max}
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                placeholder={String(priceRange.min)}
                className="w-full h-9 bg-brand-elevated border border-brand-border rounded-lg px-2 text-sm text-white placeholder:text-brand-border focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="max-price"
                className="text-[10px] text-brand-muted uppercase tracking-wide mb-1 block"
              >
                Máximo
              </label>
              <input
                id="max-price"
                type="number"
                min={priceRange.min}
                max={priceRange.max}
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                placeholder={String(priceRange.max)}
                className="w-full h-9 bg-brand-elevated border border-brand-border rounded-lg px-2 text-sm text-white placeholder:text-brand-border focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          </div>
          <button
            onClick={applyPrice}
            className="w-full h-9 rounded-lg bg-brand-elevated border border-brand-border text-sm text-white hover:border-brand-accent hover:text-brand-accent transition-all duration-150 font-medium"
          >
            Aplicar precio
          </button>
        </div>
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
        <p className="text-xs font-black uppercase tracking-widest text-brand-muted mb-4">
          Filtros
        </p>
        {filtersBody}
      </aside>

      {/* Mobile: trigger button */}
      <div className="lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-brand-border text-sm text-brand-muted hover:text-white hover:border-brand-muted transition-all"
          aria-label="Abrir filtros"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/70"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="w-72 max-w-[85vw] bg-brand-surface border-l border-brand-border flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-brand-border">
              <span className="text-sm font-black uppercase tracking-widest text-white">
                Filtros
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar filtros"
                className="p-1.5 text-brand-muted hover:text-white rounded-lg hover:bg-brand-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1">{filtersBody}</div>
            <div className="p-4 border-t border-brand-border">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full h-11 rounded-xl bg-brand-accent text-white text-sm font-bold uppercase tracking-wide hover:bg-[#e04d18] transition-colors"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
