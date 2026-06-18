'use client'
import { useCartStore } from '@/store/cart-store'
import toast from 'react-hot-toast'
import type { CartItem } from '@/types'

export function useCart() {
  const store = useCartStore()
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    store.addItem(item)
    toast.success(`${item.name} agregado al carrito`, { icon: '🛒' })
  }
  const removeFromCart = (variantId: string, name?: string) => {
    store.removeItem(variantId)
    if (name) toast(`${name} eliminado`, { icon: '✕' })
  }
  return { ...store, addToCart, removeFromCart }
}
