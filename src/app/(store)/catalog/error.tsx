'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
      <p className="text-brand-muted">Ocurrió un error al cargar el catálogo.</p>
      <button
        onClick={reset}
        className="text-brand-accent hover:underline font-medium"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
