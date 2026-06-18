// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { InventoryTable } from '@/components/admin/inventory-table'

export const metadata: Metadata = { title: 'Inventario' }
export const dynamic = 'force-dynamic'

export default async function AdminInventoryPage() {
  const variants = await db.productVariant.findMany({
    orderBy: [{ product: { name: 'asc' } }, { size: 'asc' }],
    include: {
      product: { select: { id: true, name: true, slug: true } },
      inventory: true,
    },
  })

  const lowStockCount = variants.filter((v) => {
    const avail = Math.max(0, (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0))
    return avail < 3
  }).length

  const serialized = variants.map((v) => ({
    variantId: v.id,
    productId: v.product.id,
    productName: v.product.name,
    productSlug: v.product.slug,
    size: v.size,
    sku: v.sku,
    isActive: v.isActive,
    quantity: v.inventory?.quantity ?? 0,
    reserved: v.inventory?.reserved ?? 0,
    available: Math.max(0, (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0)),
  }))

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Inventario</h1>
          <p className="text-brand-muted text-sm mt-1">
            {variants.length} variantes totales
            {lowStockCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-brand-error/20 text-brand-error text-xs font-semibold rounded-full">
                {lowStockCount} stock bajo
              </span>
            )}
          </p>
        </div>
      </div>

      <InventoryTable rows={serialized} />
    </div>
  )
}
