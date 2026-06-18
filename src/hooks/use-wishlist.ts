'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useWishlistStore } from '@/store/wishlist-store'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

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

export function useWishlist() {
  const store = useWishlistStore()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const addToWishlist = (item: WishlistItem) => {
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/wishlist')
      return
    }
    if (store.hasItem(item.variantId)) {
      store.removeItem(item.variantId)
      toast('Eliminado de tu lista de deseos', { icon: '♡' })
    } else {
      store.addItem(item)
      toast.success('Agregado a tu lista de deseos', { icon: '♥' })
    }
  }

  return {
    ...store,
    addToWishlist,
  }
}
