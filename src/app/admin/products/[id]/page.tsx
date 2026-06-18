// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { EditProductClient } from '@/components/admin/edit-product-client'

export const metadata: Metadata = { title: 'Editar producto' }

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, brands, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        variants: {
          include: { inventory: true },
          orderBy: { size: 'asc' },
        },
      },
    }),
    db.brand.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    db.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  if (!product) notFound()

  const serialized = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription ?? '',
    brandId: product.brandId,
    categoryId: product.categoryId,
    gender: product.gender ?? '',
    colorway: product.colorway ?? '',
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    cost: product.cost ? Number(product.cost) : null,
    status: product.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED',
    isFeatured: product.isFeatured,
    isLimitedEdition: product.isLimitedEdition,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    tags: product.tags.join(', '),
    metaTitle: product.metaTitle ?? '',
    metaDescription: product.metaDescription ?? '',
    imageUrlsList: product.images.map((i) => i.url),
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      sku: v.sku,
      price: v.price ? Number(v.price) : null,
      stock: v.inventory?.quantity ?? 0,
      isActive: v.isActive,
    })),
  }

  return (
    <EditProductClient
      product={serialized}
      brands={brands}
      categories={categories}
    />
  )
}
