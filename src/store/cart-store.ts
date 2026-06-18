'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CouponApplied { code: string; discount: number; type: string }

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  coupon: CouponApplied | null
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  applyCoupon: (coupon: CouponApplied) => void
  removeCoupon: () => void
  getSubtotal: () => number
  getDiscount: () => number
  getTotal: () => number
  getItemCount: () => number
  hasItem: (variantId: string) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.maxQuantity) }
                  : i
              ),
              isOpen: true,
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true }
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.variantId !== variantId)
            : state.items.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i)),
        })),
      clearCart: () => set({ items: [], coupon: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getDiscount: () => {
        const { coupon, getSubtotal } = get()
        if (!coupon) return 0
        if (coupon.type === 'PERCENTAGE') return getSubtotal() * (coupon.discount / 100)
        if (coupon.type === 'FIXED') return Math.min(coupon.discount, getSubtotal())
        return 0
      },
      getTotal: () => Math.max(0, get().getSubtotal() - get().getDiscount()),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      hasItem: (variantId) => get().items.some((i) => i.variantId === variantId),
    }),
    { name: 'sneakersmon-cart', storage: createJSONStorage(() => localStorage) }
  )
)
