// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { ProductGallery } from '@/components/store/product-gallery'
import { ProductSizeSelector } from '@/components/store/product-size-selector'
import { StockMonitor } from '@/components/store/stock-monitor'
import { AddToCartButton } from '@/components/store/add-to-cart-button'
import { WishlistButton } from '@/components/store/wishlist-button'
import { ProductReviews } from '@/components/store/product-reviews'
import { RelatedProducts } from '@/components/store/related-products'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, getDiscountPercentage } from '@/lib/utils'
import { Shield, Truck, RotateCcw, Tag } from 'lucide-react'
import type { ProductVariant } from '@/types'

// ─── Interactive product panel (client island) ────────────────────────────────
// We wrap size selector + add-to-cart in a client component so they share state.
import { ProductActions } from '@/components/store/product-actions'

export const dynamic = 'force-dynamic'
// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  })
  if (!product) return {}
  return {
    title: `${product.name} — ${product.brand.name} | SNEAKERSMON HIDALGO`,
    description: product.shortDescription ?? product.description.substring(0, 160),
    openGraph: {
      images: product.images[0]
        ? [{ url: product.images[0].url, width: 1200, height: 1200, alt: product.name }]
        : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await db.product.findUnique({
    where: { slug, status: 'ACTIVE' },
    include: {
      brand: { select: { id: true, name: true, slug: true, logo: true, description: true } },
      category: { select: { id: true, name: true, slug: true, parentId: true } },
      images: { orderBy: { order: 'asc' } },
      variants: {
        where: { isActive: true },
        include: { inventory: true },
        orderBy: { size: 'asc' },
      },
    },
  })

  if (!product) notFound()

  // Serialize Decimal fields to plain numbers for client components
  type RawVariant = {
    id: string; productId: string; size: string; sku: string
    price: { toNumber?: () => number } | number | null; isActive: boolean
    inventory: { quantity: number; reserved: number } | null
  }
  const variants: ProductVariant[] = (product.variants as RawVariant[]).map((v) => ({
    id: v.id,
    productId: v.productId,
    size: v.size,
    sku: v.sku,
    price: v.price
      ? typeof v.price === 'object' && v.price.toNumber
        ? v.price.toNumber()
        : Number(v.price)
      : null,
    isActive: v.isActive,
    inventory: v.inventory
      ? { quantity: v.inventory.quantity, reserved: v.inventory.reserved }
      : null,
  }))

  type RawImage = { id: string; url: string; altText: string | null; order: number; isPrimary: boolean }
  const images = (product.images as RawImage[]).map((img) => ({
    id: img.id,
    url: img.url,
    altText: img.altText,
    order: img.order,
    isPrimary: img.isPrimary,
  }))

  const discountPct = product.compareAtPrice
    ? getDiscountPercentage(Number(product.price), Number(product.compareAtPrice))
    : null

  const totalStock = variants.reduce((sum: number, v: ProductVariant) => {
    if (!v.inventory) return sum
    return sum + Math.max(0, v.inventory.quantity - v.inventory.reserved)
  }, 0)

  const primaryImage =
    images.find((i) => i.isPrimary)?.url ?? images[0]?.url ?? ''

  // Product shape for client components
  const productForClient = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    brand: {
      id: product.brand.id,
      name: product.brand.name,
      slug: product.brand.slug,
    },
    images: images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* ── Left: image gallery ── */}
        <div>
          <ProductGallery images={images} productName={product.name} />
        </div>

        {/* ── Right: product info ── */}
        <div className="flex flex-col gap-5 lg:gap-6">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-xs text-brand-muted uppercase tracking-wide"
            aria-label="Breadcrumb"
          >
            <span>{product.category.name}</span>
            <span>/</span>
            <span className="text-brand-muted">{product.brand.name}</span>
          </nav>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {product.isLimitedEdition && (
              <Badge variant="limited">Edición Limitada</Badge>
            )}
            {product.isNewArrival && (
              <Badge variant="new">Nuevo Ingreso</Badge>
            )}
            {product.isBestSeller && (
              <Badge variant="gold">Más Vendido</Badge>
            )}
          </div>

          {/* Name */}
          <div>
            <p className="text-sm text-brand-muted font-semibold mb-1">
              {product.brand.name}
            </p>
            <h1 className="font-display text-3xl lg:text-4xl font-black text-white leading-tight">
              {product.name}
            </h1>
            {product.colorway && (
              <p className="text-sm text-brand-muted mt-2">{product.colorway}</p>
            )}
            {product.season && (
              <p className="text-xs text-brand-border mt-1 uppercase tracking-wide font-mono">
                {product.season}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-mono font-bold text-white">
              {formatPrice(Number(product.price))}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg font-mono text-brand-muted line-through">
                  {formatPrice(Number(product.compareAtPrice))}
                </span>
                {discountPct && (
                  <Badge variant="accent">-{discountPct}%</Badge>
                )}
              </>
            )}
          </div>

          {/* Stock level */}
          <StockMonitor available={totalStock} />

          {/* Size selector + Add to cart (client island with shared state) */}
          <ProductActions
            variants={variants}
            product={productForClient}
          />

          {/* Wishlist */}
          <div className="flex items-center gap-3">
            <WishlistButton product={productForClient} />
            <span className="text-sm text-brand-muted">
              Agregar a favoritos
            </span>
          </div>

          {/* Trust signals */}
          <div className="border-t border-brand-border pt-5 space-y-3">
            {[
              { icon: Truck,      text: 'Envío gratis en pedidos +$3,000 MXN' },
              { icon: Shield,     text: 'Sneakers 100% auténticos garantizados' },
              { icon: RotateCcw,  text: 'Cambios y devoluciones en 30 días' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-brand-muted">
                <Icon className="w-4 h-4 text-brand-accent shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-brand-border pt-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-brand-muted mb-3">
                Descripción
              </h2>
              <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Tag className="w-3.5 h-3.5 text-brand-border shrink-0 mt-0.5" />
              {(product.tags as string[]).map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full border border-brand-border text-brand-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <Suspense
        fallback={
          <div className="mt-16 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        }
      >
        <ProductReviews productId={product.id} />
      </Suspense>

      {/* Related products */}
      <Suspense
        fallback={
          <div className="mt-16 space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <RelatedProducts
          productId={product.id}
          categoryId={product.categoryId}
          brandId={product.brandId}
        />
      </Suspense>
    </div>
  )
}
