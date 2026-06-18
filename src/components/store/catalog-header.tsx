// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.

interface CatalogHeaderProps {
  total: number
  query?: string
}

export function CatalogHeader({ total, query }: CatalogHeaderProps) {
  return (
    <div>
      <h1 className="font-display text-2xl font-black tracking-tight text-white">
        {query ? (
          <>
            Resultados para{' '}
            <span className="text-brand-accent">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          'Catálogo'
        )}
      </h1>
      <p className="text-sm text-brand-muted mt-0.5">
        {total === 0
          ? 'No se encontraron productos'
          : total === 1
          ? '1 producto encontrado'
          : `${total.toLocaleString('es-MX')} productos encontrados`}
      </p>
    </div>
  )
}
