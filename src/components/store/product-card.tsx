'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Zap } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { formatPrice, getDiscountPercentage } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types'
import { cn } from '@/lib/utils'

const MAX_SIZES_SHOWN = 5

interface ProductCardProps {
  product: ProductCardType
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { openCart } = useCartStore()

  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? getDiscountPercentage(product.price, product.compareAtPrice)
      : 0

  const visibleSizes = product.availableSizes.slice(0, MAX_SIZES_SHOWN)
  const extraSizes = product.availableSizes.length - MAX_SIZES_SHOWN
  const isLowStock = product.totalStock > 0 && product.totalStock < 3
  const isOutOfStock = product.totalStock === 0

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Open cart — full size selection can be done in product page
    openCart()
  }

  return (
    <motion.div
      className="group relative flex flex-col bg-brand-surface rounded-[var(--radius-lg)] overflow-hidden border border-brand-border"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="contents" tabIndex={-1} aria-hidden="true">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-brand-elevated">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-transform duration-500',
                isHovered ? 'scale-110' : 'scale-100'
              )}
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-12 h-12 text-brand-border" />
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.isLimitedEdition && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-brand-gold text-black">
                LIMITADO
              </span>
            )}
            {discountPct > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-accent text-white">
                -{discountPct}%
              </span>
            )}
          </div>

          {/* New badge */}
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-brand-elevated border border-brand-border text-brand-muted">
              NUEVO
            </span>
          </div>

          {/* Quick add button */}
          <AnimatePresence>
            {isHovered && !isOutOfStock && (
              <motion.button
                key="quick-add"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                onClick={handleQuickAdd}
                className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-2 h-10 rounded-lg bg-brand-accent text-white text-xs font-bold tracking-wide uppercase hover:bg-[#e04d18] transition-colors"
                aria-label={`Añadir ${product.name} al carrito`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Agregar al carrito
              </motion.button>
            )}
          </AnimatePresence>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-widest uppercase">Agotado</span>
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-3">
        {/* Brand */}
        <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-muted">
          {product.brand.name}
        </span>

        {/* Name */}
        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-medium text-white line-clamp-2 leading-snug hover:text-brand-accent transition-colors"
        >
          {product.name}
        </Link>

        {/* Sizes */}
        {product.availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleSizes.map((size) => (
              <span
                key={size}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-brand-elevated border border-brand-border text-brand-muted"
              >
                {size}
              </span>
            ))}
            {extraSizes > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-brand-elevated border border-brand-border text-brand-muted">
                +{extraSizes}
              </span>
            )}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-base font-bold font-display text-white">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs line-through text-brand-muted">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Low stock indicator */}
        {isLowStock && (
          <p className="text-[11px] font-semibold text-brand-error flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-error inline-block animate-pulse" />
            Quedan {product.totalStock} pares
          </p>
        )}
      </div>
    </motion.div>
  )
}
