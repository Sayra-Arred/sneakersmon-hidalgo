// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { ProductsTable } from '@/components/admin/products-table'

export const metadata: Metadata = { title: 'Productos' }
export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const [products, brands, categories] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        variants: {
          select: {
            id: true,
            inventory: { select: { quantity: true, reserved: true } },
          },
        },
      },
    }),
    db.brand.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    db.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const serialized = products.map((p) => {
    const totalStock = p.variants.reduce((sum, v) => {
      const qty = v.inventory?.quantity ?? 0
      const res = v.inventory?.reserved ?? 0
      return sum + Math.max(0, qty - res)
    }, 0)
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brandId: p.brand.id,
      brandName: p.brand.name,
      categoryId: p.category.id,
      categoryName: p.category.name,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      status: p.status,
      isFeatured: p.isFeatured,
      isLimitedEdition: p.isLimitedEdition,
      primaryImage: p.images[0]?.url ?? null,
      totalStock,
      variantCount: p.variants.length,
      createdAt: p.createdAt.toISOString(),
    }
  })

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Productos</h1>
          <p className="text-brand-muted text-sm mt-1">{products.length} productos en total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Link>
      </div>

      <ProductsTable
        products={serialized}
        brands={brands}
        categories={categories}
        formatPrice={formatPrice}
        formatDate={formatDate}
      />
    </div>
  )
}
