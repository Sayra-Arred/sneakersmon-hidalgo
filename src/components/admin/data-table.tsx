// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export interface ColumnDef<T> {
  key: string
  header: string
  headerClassName?: string
  className?: string
  sortable?: boolean
  cell?: (row: T) => React.ReactNode
  accessorKey?: keyof T
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange?: (page: number) => void
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  skeletonRows?: number
  pagination?: PaginationConfig
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  className?: string
  rowKey?: (row: T) => string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 8,
  pagination,
  emptyMessage = 'Sin resultados',
  emptyIcon,
  sortKey,
  sortDir,
  className,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className={cn('bg-brand-elevated border border-brand-border rounded-xl overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-brand-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-5 py-3 text-xs uppercase tracking-widest text-brand-muted font-semibold whitespace-nowrap',
                    col.headerClassName ?? 'text-left',
                    col.sortable && 'cursor-pointer select-none hover:text-white transition-colors'
                  )}
                >
                  {col.sortable ? (
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </span>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-brand-border">
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3.5">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    {emptyIcon && (
                      <div className="flex justify-center mb-3 text-brand-muted">{emptyIcon}</div>
                    )}
                    <p className="text-brand-muted text-sm">{emptyMessage}</p>
                  </td>
                </tr>
              )
              : data.map((row, i) => (
                <tr
                  key={rowKey ? rowKey(row) : i}
                  className="hover:bg-brand-border/20 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-5 py-3.5 text-sm', col.className)}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey != null
                        ? String(row[col.accessorKey] ?? '—')
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-5 py-3 border-t border-brand-border flex items-center justify-between gap-4">
          <p className="text-xs text-brand-muted shrink-0">
            {((pagination.page - 1) * pagination.pageSize) + 1}–
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{' '}
            {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => pagination.onPageChange?.(p)}
                  className={cn(
                    'w-7 h-7 text-xs rounded-md transition-colors',
                    p === pagination.page
                      ? 'bg-brand-accent text-white font-semibold'
                      : 'text-brand-muted hover:text-white hover:bg-brand-border'
                  )}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
