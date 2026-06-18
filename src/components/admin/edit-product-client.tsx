'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useRouter } from 'next/navigation'
import { ProductForm } from '@/components/admin/product-form'
import { updateFullProduct } from '@/app/actions/admin-products'
import type { FullProductInput } from '@/app/actions/admin-products'
import { deleteProduct as archiveProduct } from '@/app/actions/products'
import toast from 'react-hot-toast'
import { Trash2, ExternalLink } from 'lucide-react'

interface SelectOption {
  id: string
  name: string
}

interface ProductData {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  brandId: string
  categoryId: string
  gender: string
  colorway: string
  price: number
  compareAtPrice: number | null
  cost: number | null
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  isFeatured: boolean
  isLimitedEdition: boolean
  isBestSeller: boolean
  isNewArrival: boolean
  tags: string
  metaTitle: string
  metaDescription: string
  imageUrlsList: string[]
  variants: Array<{
    id: string
    size: string
    sku: string
    price: number | null
    stock: number
    isActive: boolean
  }>
}

interface EditProductClientProps {
  product: ProductData
  brands: SelectOption[]
  categories: SelectOption[]
}

export function EditProductClient({ product, brands, categories }: EditProductClientProps) {
  const router = useRouter()

  async function handleSubmit(data: FullProductInput) {
    return updateFullProduct(product.id, data)
  }

  async function handleDelete() {
    if (!confirm(`¿Archivar "${product.name}"? El producto dejará de aparecer en la tienda.`)) return
    const result = await archiveProduct(product.id)
    if (result.success) {
      toast.success('Producto archivado')
      router.push('/admin/products')
      router.refresh()
    } else {
      toast.error(result.error ?? 'Error al archivar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Editar producto</h1>
          <p className="text-brand-muted text-sm mt-1">{product.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/product/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 border border-brand-border text-brand-muted hover:text-white rounded-lg text-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver en tienda
          </a>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 border border-brand-error/40 text-brand-error hover:bg-brand-error/10 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Archivar
          </button>
        </div>
      </div>

      <ProductForm
        brands={brands}
        categories={categories}
        productId={product.id}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          brandId: product.brandId,
          categoryId: product.categoryId,
          gender: product.gender,
          colorway: product.colorway,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          cost: product.cost,
          status: product.status,
          isFeatured: product.isFeatured,
          isLimitedEdition: product.isLimitedEdition,
          isBestSeller: product.isBestSeller,
          isNewArrival: product.isNewArrival,
          tags: product.tags,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          imageUrlsList: product.imageUrlsList,
          variants: product.variants,
        }}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </div>
  )
}
