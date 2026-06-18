// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
'use client'
import { useEffect, useState } from 'react'
import { ProductForm } from '@/components/admin/product-form'
import { createFullProduct } from '@/app/actions/admin-products'
import type { FullProductInput } from '@/app/actions/admin-products'

interface SelectOption {
  id: string
  name: string
}

export default function NewProductPage() {
  const [brands, setBrands] = useState<SelectOption[]>([])
  const [categories, setCategories] = useState<SelectOption[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/brands-categories')
      if (res.ok) {
        const data = await res.json()
        setBrands(data.brands)
        setCategories(data.categories)
      }
    }
    load()
  }, [])

  async function handleSubmit(data: FullProductInput) {
    return createFullProduct(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Nuevo producto</h1>
        <p className="text-brand-muted text-sm mt-1">Completa la información para agregar un producto</p>
      </div>
      <ProductForm
        brands={brands}
        categories={categories}
        onSubmit={handleSubmit}
        submitLabel="Crear producto"
      />
    </div>
  )
}
