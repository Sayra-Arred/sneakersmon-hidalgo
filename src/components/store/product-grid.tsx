// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { ProductCard } from '@/components/store/product-card'
import type { ProductCard as ProductCardType } from '@/types'

interface ProductGridProps {
  products: ProductCardType[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-4xl mb-4 select-none">👟</p>
        <h2 className="font-display text-lg font-bold text-white mb-2">
          No encontramos lo que buscas
        </h2>
        <p className="text-sm text-brand-muted max-w-xs">
          Intenta cambiar los filtros o buscar por otro término.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  )
}
