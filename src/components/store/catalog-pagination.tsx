'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CatalogPaginationProps {
  page: number
  totalPages: number
}

export function CatalogPagination({ page, totalPages }: CatalogPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (totalPages <= 1) return null

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: true })
    })
  }

  // Build page numbers to display
  const pages: (number | 'ellipsis')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('ellipsis')
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
  }

  const btnBase =
    'h-9 min-w-[2.25rem] px-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none'

  return (
    <nav
      aria-label="Paginación"
      className={cn(
        'flex items-center justify-center gap-1.5 mt-10',
        isPending && 'opacity-60 pointer-events-none'
      )}
    >
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={cn(
          btnBase,
          'flex items-center gap-1 px-3 border border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            className="h-9 w-9 flex items-center justify-center text-brand-muted text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p)}
            aria-label={`Página ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              btnBase,
              p === page
                ? 'bg-brand-accent text-white border border-brand-accent'
                : 'border border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className={cn(
          btnBase,
          'flex items-center gap-1 px-3 border border-brand-border text-brand-muted hover:text-white hover:border-brand-muted'
        )}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
