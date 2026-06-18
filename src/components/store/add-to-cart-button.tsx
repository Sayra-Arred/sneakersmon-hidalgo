'use client'

import { useState } from 'react'
import { ShoppingBag, Check, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'
import { getAvailableStock } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Product, ProductVariant } from '@/types'

type CartProduct = Pick<
  Product,
  'id' | 'name' | 'slug' | 'price'
> & {
  brand: { name: string }
  images: { url: string; isPrimary: boolean }[]
}

interface AddToCartButtonProps {
  product: CartProduct
  variant: ProductVariant | null
  className?: string
}

type ButtonState = 'idle' | 'success' | 'error'

export function AddToCartButton({
  product,
  variant,
  className,
}: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [state, setState] = useState<ButtonState>('idle')

  const available = variant ? getAvailableStock(variant.inventory) : 0
  const isOOS = variant ? available <= 0 : false
  const noVariant = !variant
  const isDisabled = noVariant || isOOS || state === 'success'

  const handleAddToCart = () => {
    if (isDisabled || !variant) return

    const primaryImage =
      product.images.find((img) => img.isPrimary)?.url ??
      product.images[0]?.url ??
      ''

    addToCart({
      id: `${product.id}-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand.name,
      size: variant.size,
      price: variant.price ?? product.price,
      image: primaryImage,
      maxQuantity: available,
    })

    setState('success')
    setTimeout(() => setState('idle'), 2000)
  }

  const label = noVariant
    ? 'Selecciona tu talla'
    : isOOS
    ? 'Agotado'
    : state === 'success'
    ? '¡Agregado al carrito!'
    : 'Agregar al carrito'

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      aria-label={label}
      className={cn(
        'relative w-full h-14 rounded-xl font-bold text-base uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black overflow-hidden select-none',
        noVariant
          ? 'bg-brand-elevated border border-dashed border-brand-border text-brand-muted cursor-not-allowed'
          : isOOS
          ? 'bg-brand-error/10 border border-brand-error/30 text-brand-error cursor-not-allowed'
          : state === 'success'
          ? 'bg-brand-success text-white cursor-default'
          : 'bg-brand-accent text-white hover:bg-[#e04d18] active:scale-[0.98] shadow-[0_0_0_0_rgba(255,90,31,0)] hover:shadow-[0_0_32px_rgba(255,90,31,0.4)]',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {noVariant && (
          <motion.span
            key="no-variant"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            {label}
          </motion.span>
        )}

        {!noVariant && isOOS && (
          <motion.span
            key="oos"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-2"
          >
            {label}
          </motion.span>
        )}

        {!noVariant && !isOOS && state === 'idle' && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            {label}
          </motion.span>
        )}

        {!noVariant && !isOOS && state === 'success' && (
          <motion.span
            key="success"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" strokeWidth={3} />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
