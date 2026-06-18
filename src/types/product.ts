// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent?: Pick<Category, 'id' | 'name' | 'slug'> | null
}

export interface ProductImage {
  id: string
  url: string
  altText: string | null
  order: number
  isPrimary: boolean
}

export interface InventoryRecord {
  quantity: number
  reserved: number
}

export interface ProductVariant {
  id: string
  productId: string
  size: string
  sku: string
  price: number | null
  isActive: boolean
  inventory: InventoryRecord | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string | null
  brand: Brand
  category: Category
  gender: string | null
  season: string | null
  colorway: string | null
  price: number
  compareAtPrice: number | null
  cost: number | null
  sku: string | null
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  isFeatured: boolean
  isLimitedEdition: boolean
  isBestSeller: boolean
  isNewArrival: boolean
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  metaTitle: string | null
  metaDescription: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type ProductCard = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  brand: Pick<Brand, 'id' | 'name' | 'slug'>
  isFeatured: boolean
  isLimitedEdition: boolean
  isBestSeller: boolean
  colorway: string | null
  primaryImage: string | null
  availableSizes: string[]
  totalStock: number
}

export interface CartItem {
  id: string
  productId: string
  variantId: string
  name: string
  slug: string
  brand: string
  size: string
  price: number
  image: string
  quantity: number
  maxQuantity: number
}

export interface WishlistItem {
  id: string
  productId: string
  variantId: string | null
  name: string
  slug: string
  brand: string
  size: string | null
  price: number
  image: string
}

export interface SearchFilters {
  q?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  size?: string
  gender?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  page?: number
  limit?: number
}
