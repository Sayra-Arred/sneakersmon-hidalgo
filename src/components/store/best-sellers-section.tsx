// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { ProductCard } from '@/components/store/product-card'
import type { ProductCard as ProductCardType } from '@/types'

interface RawProduct {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  isFeatured: boolean
  isLimitedEdition: boolean
  isBestSeller: boolean
  colorway: string | null
  brand: { id: string; name: string; slug: string }
  images: { url: string; isPrimary: boolean }[]
  variants: { isActive: boolean; size: string; inventory: { quantity: number; reserved: number } | null }[]
}

function toProductCard(p: RawProduct): ProductCardType {
  const activeVariants = p.variants.filter((v) => v.isActive)
  const availableSizes = activeVariants
    .filter((v) => v.inventory && v.inventory.quantity - v.inventory.reserved > 0)
    .map((v) => v.size)
  const totalStock = activeVariants.reduce((sum, v) => {
    if (!v.inventory) return sum
    return sum + Math.max(0, v.inventory.quantity - v.inventory.reserved)
  }, 0)
  const primaryImage = p.images.find((img) => img.isPrimary)?.url ?? p.images[0]?.url ?? null

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    brand: { id: p.brand.id, name: p.brand.name, slug: p.brand.slug },
    isFeatured: p.isFeatured,
    isLimitedEdition: p.isLimitedEdition,
    isBestSeller: p.isBestSeller,
    colorway: p.colorway,
    primaryImage,
    availableSizes,
    totalStock,
  }
}

interface BestSellersSectionProps {
  products: RawProduct[]
}

export function BestSellersSection({ products }: BestSellersSectionProps) {
  const cards = products.map(toProductCard)

  return (
    <section className="py-16 sm:py-24 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-brand-accent" />
              <span className="text-xs font-bold tracking-widest uppercase text-brand-accent">
                Los más populares
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight relative inline-block">
              MÁS VENDIDOS
              <span
                className="absolute -bottom-2 left-0 h-1 rounded-full"
                style={{
                  width: '40%',
                  background: 'linear-gradient(90deg, #D4AF37, #FF5A1F)',
                }}
                aria-hidden="true"
              />
            </h2>
          </div>
          <Link
            href="/catalog?sort=popular"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:text-white transition-colors group"
          >
            Ver todos
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex sm:hidden gap-4 overflow-x-auto no-scrollbar pb-2">
          {cards.map((product, i) => (
            <div key={product.id} className="flex-shrink-0 w-48">
              <ProductCard product={product} priority={i < 2} />
            </div>
          ))}
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {cards.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>

        {/* Mobile "Ver todos" */}
        <div className="flex sm:hidden justify-center mt-6">
          <Link
            href="/catalog?sort=popular"
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:text-white transition-colors"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
