'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlistStore } from '@/store/wishlist-store'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

interface WishlistButtonProps {
  product: Pick<Product, 'id' | 'name' | 'slug' | 'price'> & {
    brand: { name: string }
    images: { url: string; isPrimary: boolean }[]
  }
  className?: string
  size?: 'sm' | 'md'
}

export function WishlistButton({
  product,
  className,
  size = 'md',
}: WishlistButtonProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addItem, removeItem, hasItem } = useWishlistStore()

  // Use productId as the key (no variant selected at this level)
  const wishlistKey = product.id
  const [inWishlist, setInWishlist] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    // hasItem checks variantId in the store, but we store productId there for product-level wishlisting
    setInWishlist(hasItem(wishlistKey))
  }, [hasItem, wishlistKey])

  const handleToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/product/' + product.slug)
      return
    }

    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)

    if (inWishlist) {
      removeItem(wishlistKey)
      setInWishlist(false)
    } else {
      const primaryImage =
        product.images.find((img) => img.isPrimary)?.url ??
        product.images[0]?.url ??
        ''

      addItem({
        id: wishlistKey,
        productId: product.id,
        variantId: wishlistKey,
        name: product.name,
        slug: product.slug,
        brand: product.brand.name,
        size: '',
        price: product.price,
        image: primaryImage,
      })
      setInWishlist(true)
    }
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'

  return (
    <button
      onClick={handleToggle}
      aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={inWishlist}
      className={cn(
        'relative flex items-center justify-center rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        inWishlist
          ? 'border-brand-error/40 bg-brand-error/10 text-brand-error hover:bg-brand-error/20'
          : 'border-brand-border bg-brand-elevated text-brand-muted hover:text-white hover:border-brand-muted',
        btnSize,
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={inWishlist ? 'filled' : 'empty'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: animating ? [1, 1.4, 1] : 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={
            animating
              ? { duration: 0.4, times: [0, 0.5, 1], ease: 'easeOut' }
              : { duration: 0.15 }
          }
          className="flex items-center justify-center"
        >
          <Heart
            className={cn(iconSize, inWishlist && 'fill-brand-error')}
            strokeWidth={inWishlist ? 0 : 1.5}
          />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
