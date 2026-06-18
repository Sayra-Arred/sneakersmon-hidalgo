// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { db } from '@/lib/db'
import { ProductCard } from '@/components/store/product-card'
import type { ProductCard as ProductCardType } from '@/types'

interface RelatedProductsProps {
  productId: string
  categoryId: string
  brandId: string
}

export async function RelatedProducts({
  productId,
  categoryId,
  brandId,
}: RelatedProductsProps) {
  const raw = await db.product.findMany({
    where: {
      status: 'ACTIVE',
      id: { not: productId },
      OR: [{ categoryId }, { brandId }],
    },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: { isActive: true },
        include: { inventory: { select: { quantity: true, reserved: true } } },
      },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 8,
  })

  if (raw.length === 0) return null

  const products: ProductCardType[] = raw.map((p) => {
    const availableSizes = p.variants
      .filter(
        (v) =>
          v.inventory &&
          v.inventory.quantity - v.inventory.reserved > 0
      )
      .map((v) => v.size)

    const totalStock = p.variants.reduce((sum, v) => {
      if (!v.inventory) return sum
      return sum + Math.max(0, v.inventory.quantity - v.inventory.reserved)
    }, 0)

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      brand: { id: p.brand.id, name: p.brand.name, slug: p.brand.slug },
      isFeatured: p.isFeatured,
      isLimitedEdition: p.isLimitedEdition,
      isBestSeller: p.isBestSeller,
      colorway: p.colorway,
      primaryImage: p.images[0]?.url ?? null,
      availableSizes,
      totalStock,
    }
  })

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      <h2
        id="related-heading"
        className="font-display text-xl font-black text-white mb-6 uppercase tracking-tight"
      >
        También te puede gustar
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
