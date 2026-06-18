'use client'

// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
// Client island: holds shared state for size selection + add to cart.

import { useState } from 'react'
import { ProductSizeSelector } from '@/components/store/product-size-selector'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import type { ProductVariant } from '@/types'

interface ProductActionsProps {
  variants: ProductVariant[]
  product: {
    id: string
    name: string
    slug: string
    price: number
    brand: { name: string }
    images: { url: string; isPrimary: boolean }[]
  }
}

export function ProductActions({ variants, product }: ProductActionsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <ProductSizeSelector
        variants={variants}
        selectedVariant={selectedVariant}
        onSelect={setSelectedVariant}
      />
      <AddToCartButton variant={selectedVariant} product={product} />
    </div>
  )
}
