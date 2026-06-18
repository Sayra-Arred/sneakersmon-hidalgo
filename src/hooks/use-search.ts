'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState, useCallback, useRef } from 'react'
import type { ProductCard } from '@/types'

interface SearchState {
  query: string
  results: ProductCard[]
  isLoading: boolean
  error: string | null
}

export function useSearch() {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
  })
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setState((s) => ({ ...s, results: [], query: q }))
      return
    }

    setState((s) => ({ ...s, query: q, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setState((s) => ({ ...s, results: data.data ?? [], isLoading: false }))
    } catch {
      setState((s) => ({ ...s, error: 'Error al buscar', isLoading: false }))
    }
  }, [])

  const setQuery = useCallback(
    (q: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      setState((s) => ({ ...s, query: q }))
      debounceTimer.current = setTimeout(() => search(q), 300)
    },
    [search]
  )

  const clearSearch = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    setState({ query: '', results: [], isLoading: false, error: null })
  }, [])

  return { ...state, setQuery, clearSearch }
}
