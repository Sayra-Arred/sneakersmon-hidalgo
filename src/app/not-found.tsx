// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-brand-black flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div
        className="font-display font-black leading-none select-none"
        style={{ fontSize: 'clamp(120px, 20vw, 200px)', color: '#1c1c1e' }}
        aria-hidden="true"
      >
        404
      </div>
      <div className="space-y-3 -mt-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Página no encontrada</h1>
        <p className="text-brand-muted max-w-md">
          Esta página no existe o fue removida. Explora nuestro catálogo de sneakers.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-6 bg-brand-accent text-white font-semibold rounded-lg hover:bg-[#e04d18] transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/catalog"
          className="inline-flex items-center justify-center h-11 px-6 bg-brand-elevated border border-brand-border text-white font-semibold rounded-lg hover:border-brand-accent transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}
