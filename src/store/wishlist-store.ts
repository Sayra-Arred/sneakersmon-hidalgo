'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistItem {
  id: string
  productId: string
  variantId: string
  name: string
  slug: string
  brand: string
  size: string
  price: number
  image: string
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (variantId: string) => void
  hasItem: (variantId: string) => boolean
  clearWishlist: () => void
  getCount: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.variantId === item.variantId)
          if (exists) return state
          return { items: [...state.items, item] }
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      hasItem: (variantId) => get().items.some((i) => i.variantId === variantId),
      clearWishlist: () => set({ items: [] }),
      getCount: () => get().items.length,
    }),
    { name: 'sneakersmon-wishlist', storage: createJSONStorage(() => localStorage) }
  )
)
