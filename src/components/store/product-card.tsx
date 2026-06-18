'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useTilt } from '@/hooks/use-tilt'
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
  const { ref, style, glow, onMove, onLeave } = useTilt(14)

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
    openCart()
  }

  return (
    <div
      ref={ref}
      style={{ ...style, willChange: 'transform', transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={() => { onLeave(); setIsHovered(false) }}
      onMouseEnter={() => setIsHovered(true)}
      className="relative group flex flex-col bg-brand-surface rounded-[var(--radius-lg)] overflow-hidden border border-brand-border"
    >
      {/* Mouse-tracking spotlight glow */}
      <div
        className="absolute inset-0 pointer-events-none z-10 rounded-[var(--radius-lg)] transition-opacity duration-300"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(280px circle at ${glow.x}px ${glow.y}px, rgba(255,90,31,0.18), rgba(212,175,55,0.06) 40%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Glowing border on hover */}
      <div
        className="absolute inset-0 pointer-events-none z-10 rounded-[var(--radius-lg)] transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow: 'inset 0 0 0 1.5px rgba(255,90,31,0.6), 0 0 28px rgba(255,90,31,0.25)',
        }}
        aria-hidden="true"
      />

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
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <motion.span
                className="text-5xl"
                animate={isHovered ? { y: [-4, 4, -4], rotate: [0, 8, 0] } : {}}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                🐻
              </motion.span>
              <motion.span
                className="text-3xl"
                animate={isHovered ? { y: [4, -4, 4], rotate: [0, -8, 0] } : {}}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              >
                👟
              </motion.span>
            </div>
          )}

          {/* Texture overlay on image */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ctext x='4' y='30' font-size='16' opacity='0.15'%3E🐻%3C/text%3E%3Ctext x='32' y='56' font-size='14' opacity='0.1'%3E👟%3C/text%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
              opacity: isHovered ? 0.5 : 0,
              transition: 'opacity 0.3s',
            }}
            aria-hidden="true"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
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

          {/* Quick add */}
          <AnimatePresence>
            {isHovered && !isOutOfStock && (
              <motion.button
                key="quick-add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
                onClick={handleQuickAdd}
                className="absolute bottom-2 inset-x-2 z-20 flex items-center justify-center gap-2 h-10 rounded-lg bg-brand-accent text-white text-xs font-bold tracking-wide uppercase hover:bg-[#e04d18] transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Agregar al carrito
              </motion.button>
            )}
          </AnimatePresence>

          {isOutOfStock && (
            <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-widest uppercase">Agotado</span>
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-3 relative z-20" style={{ transform: 'translateZ(20px)' }}>
        <span className="text-[11px] font-semibold tracking-wider uppercase text-brand-muted">
          {product.brand.name}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-medium text-white line-clamp-2 leading-snug hover:text-brand-accent transition-colors"
        >
          {product.name}
        </Link>
        {product.availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleSizes.map((size) => (
              <span key={size} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-brand-elevated border border-brand-border text-brand-muted">
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
        {isLowStock && (
          <p className="text-[11px] font-semibold text-brand-error flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-error inline-block animate-pulse" />
            Quedan {product.totalStock} pares
          </p>
        )}
      </div>
    </div>
  )
}
