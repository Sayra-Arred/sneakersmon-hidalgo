'use client'

import { useRef, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  defaultValue?: string
  placeholder?: string
  className?: string
}

export function SearchInput({
  defaultValue = '',
  placeholder = 'Buscar sneakers…',
  className,
}: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    params.delete('page')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = ''
    handleChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <Search
          className={cn(
            'w-4 h-4 transition-colors',
            isPending ? 'text-brand-accent animate-pulse' : 'text-brand-muted'
          )}
        />
      </div>
      <input
        ref={inputRef}
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full h-10 bg-brand-elevated border border-brand-border rounded-lg pl-9 pr-9 text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
        aria-label="Buscar productos"
      />
      {defaultValue && (
        <button
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute inset-y-0 right-2 flex items-center px-1 text-brand-muted hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
