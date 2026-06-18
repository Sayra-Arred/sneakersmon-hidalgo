// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { parsePageParam } from '@/lib/utils'
import { CatalogFilters } from '@/components/store/catalog-filters'
import { ProductGrid } from '@/components/store/product-grid'
import { CatalogHeader } from '@/components/store/catalog-header'
import { SearchInput } from '@/components/store/search-input'
import { SortSelector } from '@/components/store/sort-selector'
import { CatalogPagination } from '@/components/store/catalog-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductCard as ProductCardType } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Catálogo — SNEAKERSMON HIDALGO' }

const PAGE_SIZE = 24

// ─── Search param helpers ─────────────────────────────────────────────────────

type SearchParamsRaw = Promise<{
  q?: string | string[]
  category?: string | string[]
  brand?: string | string[]
  minPrice?: string | string[]
  maxPrice?: string | string[]
  size?: string | string[]
  gender?: string | string[]
  sort?: string | string[]
  page?: string | string[]
}>

function first(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined
  return Array.isArray(v) ? v[0] : v
}

// ─── Fetch filter options ─────────────────────────────────────────────────────

async function fetchFilterOptions() {
  const [categories, brands, variants, genders] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
    db.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    db.productVariant.findMany({
      where: { isActive: true, product: { status: 'ACTIVE' } },
      select: { size: true },
      distinct: ['size'],
    }),
    db.product.findMany({
      where: { status: 'ACTIVE', gender: { not: null } },
      select: { gender: true },
      distinct: ['gender'],
    }),
  ])

  const sizes = (variants as { size: string }[])
    .map((v) => v.size)
    .sort((a: string, b: string) => {
      const na = parseFloat(a)
      const nb = parseFloat(b)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return a.localeCompare(b)
    })

  return {
    categories: (categories as { name: string; slug: string }[]).map((c) => ({ label: c.name, value: c.slug })),
    brands: (brands as { name: string; slug: string }[]).map((b) => ({ label: b.name, value: b.slug })),
    sizes: sizes.map((s: string) => ({ label: s, value: s })),
    genders: (genders as { gender: string | null }[])
      .filter((g) => g.gender)
      .map((g) => ({ label: g.gender!, value: g.gender! })),
  }
}

// ─── Fetch products ───────────────────────────────────────────────────────────

async function fetchProducts(params: {
  q?: string
  category?: string
  brand?: string
  minPrice?: string
  maxPrice?: string
  size?: string
  gender?: string
  sort?: string
  page: number
}) {
  const { q, category, brand, minPrice, maxPrice, size, gender, sort, page } = params

  // Build where clause with plain object — Prisma infers the type from context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { status: 'ACTIVE' }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { colorway: { contains: q, mode: 'insensitive' } },
      { tags: { has: q } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
    ]
  }

  if (category) where.category = { slug: category }
  if (brand) where.brand = { slug: brand }
  if (gender) where.gender = gender

  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
      ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
    }
  }

  if (size) {
    where.variants = {
      some: {
        size,
        isActive: true,
        inventory: { quantity: { gt: 0 } },
      },
    }
  }

  type OrderBy = { price?: 'asc' | 'desc'; isBestSeller?: 'desc'; isFeatured?: 'desc'; sortOrder?: 'asc'; isNewArrival?: 'desc'; createdAt?: 'desc' }
  const orderBy: OrderBy[] = (() => {
    switch (sort) {
      case 'price_asc':  return [{ price: 'asc' as const }]
      case 'price_desc': return [{ price: 'desc' as const }]
      case 'popular':    return [{ isBestSeller: 'desc' as const }, { isFeatured: 'desc' as const }, { sortOrder: 'asc' as const }]
      default:           return [{ isNewArrival: 'desc' as const }, { createdAt: 'desc' as const }]
    }
  })()

  const skip = (page - 1) * PAGE_SIZE

  const [total, raw] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        isFeatured: true,
        isLimitedEdition: true,
        isBestSeller: true,
        colorway: true,
        brand: { select: { id: true, name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        variants: {
          where: { isActive: true },
          select: {
            size: true,
            inventory: { select: { quantity: true, reserved: true } },
          },
        },
      },
    }),
  ])

  type RawVariant = { size: string; inventory: { quantity: number; reserved: number } | null }
  type RawProduct = {
    id: string; name: string; slug: string
    price: unknown; compareAtPrice: unknown
    isFeatured: boolean; isLimitedEdition: boolean; isBestSeller: boolean
    colorway: string | null
    brand: { id: string; name: string; slug: string }
    images: { url: string }[]
    variants: RawVariant[]
  }

  const products: ProductCardType[] = (raw as RawProduct[]).map((p) => {
    const availableSizes = p.variants
      .filter((v: RawVariant) => v.inventory && v.inventory.quantity - v.inventory.reserved > 0)
      .map((v: RawVariant) => v.size)

    const totalStock = p.variants.reduce((sum: number, v: RawVariant) => {
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

  return { products, total, totalPages: Math.ceil(total / PAGE_SIZE) }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParamsRaw
}) {
  const sp = await searchParams

  const q        = first(sp.q)
  const category = first(sp.category)
  const brand    = first(sp.brand)
  const minPrice = first(sp.minPrice)
  const maxPrice = first(sp.maxPrice)
  const size     = first(sp.size)
  const gender   = first(sp.gender)
  const sort     = first(sp.sort)
  const page     = parsePageParam(first(sp.page))

  const [{ products, total, totalPages }, filterOptions] = await Promise.all([
    fetchProducts({ q, category, brand, minPrice, maxPrice, size, gender, sort, page }),
    fetchFilterOptions(),
  ])

  const appliedFilters = { category, brand, size, gender, minPrice, maxPrice }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      {/* Top search bar */}
      <div className="mb-6">
        <Suspense fallback={<Skeleton className="h-10 w-full max-w-md" />}>
          <SearchInput defaultValue={q} className="max-w-md" />
        </Suspense>
      </div>

      <div className="flex gap-8 items-start">
        {/* Filters sidebar — desktop sticky + mobile drawer */}
        <Suspense fallback={null}>
          <CatalogFilters
            categories={filterOptions.categories}
            brands={filterOptions.brands}
            sizes={filterOptions.sizes}
            genders={filterOptions.genders}
            priceRange={{ min: 0, max: 50000 }}
            appliedFilters={appliedFilters}
          />
        </Suspense>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header row: count + sort + mobile filter trigger */}
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <CatalogHeader total={total} query={q} />
            <div className="flex items-center gap-3 flex-wrap">
              <Suspense fallback={null}>
                <SortSelector value={sort} />
              </Suspense>
            </div>
          </div>

          {/* Product grid */}
          <ProductGrid products={products} />

          {/* Pagination */}
          <Suspense fallback={null}>
            <CatalogPagination page={page} totalPages={totalPages} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
