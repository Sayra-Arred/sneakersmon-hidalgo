'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Check, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import type { DemoProduct } from './demo-products'

interface QuickBuyDrawerProps {
  product: DemoProduct | null
  onClose: () => void
}

const AGOTADO_INDICES = [2, 5, 8]

const formatPrice = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 })

export function QuickBuyDrawer({ product, onClose }: QuickBuyDrawerProps) {
  const addItem = useCartStore((s) => s.addItem)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const agotadoSizes = product
    ? product.sizes.filter((_, i) => AGOTADO_INDICES.includes(i % product.sizes.length))
    : []

  function handleAdd() {
    if (!product || !selectedSize) return

    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      variantId: `${product.id}-${selectedSize}`,
      name: product.name,
      slug: product.id,
      brand: product.brand,
      size: selectedSize,
      price: product.price,
      image: '',
      maxQuantity: 5,
    })

    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setSelectedSize(null)
      setQuantity(1)
      onClose()
    }, 1200)
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            key="qb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="qb-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-brand-surface border-l border-brand-border flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Comprar ${product.name}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border flex-shrink-0">
              <p className="text-xs font-bold tracking-widest uppercase text-brand-muted">
                Seleccionar talla
              </p>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="p-2 rounded-lg text-brand-muted hover:text-white hover:bg-brand-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {/* Emoji */}
              <div className="flex justify-center">
                <motion.span
                  className="text-7xl select-none"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {product.emoji}
                </motion.span>
              </div>

              {/* Info */}
              <div className="text-center">
                <p className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-1">
                  {product.brand}
                </p>
                <h2 className="font-display font-black text-xl text-brand-white mb-2">
                  {product.name}
                </h2>
                <p className="text-xs text-brand-muted mb-1">{product.color}</p>
                <p className="text-2xl font-bold text-brand-accent">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Size grid */}
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-3">
                  Talla (MX)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => {
                    const isAgotado = agotadoSizes.includes(size)
                    const isSelected = selectedSize === size
                    return (
                      <button
                        key={size}
                        disabled={isAgotado}
                        onClick={() => !isAgotado && setSelectedSize(size)}
                        className={cn(
                          'py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150',
                          isAgotado
                            ? 'border-brand-border text-brand-muted opacity-40 cursor-not-allowed line-through'
                            : isSelected
                            ? 'border-brand-accent bg-brand-accent text-white'
                            : 'border-brand-border bg-brand-elevated text-brand-white hover:border-brand-accent hover:text-brand-accent'
                        )}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
                {agotadoSizes.length > 0 && (
                  <p className="text-[11px] text-brand-muted mt-2">
                    Tallas grises = agotado
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-3">
                  Cantidad
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Disminuir"
                    className="w-10 h-10 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-muted hover:text-white hover:border-brand-accent transition-colors disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                    disabled={quantity >= 5}
                    aria-label="Aumentar"
                    className="w-10 h-10 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-muted hover:text-white hover:border-brand-accent transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="flex-shrink-0 border-t border-brand-border px-5 py-5">
              <motion.button
                onClick={handleAdd}
                disabled={!selectedSize || added}
                whileTap={!selectedSize ? {} : { scale: 0.97 }}
                className={cn(
                  'w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200',
                  added
                    ? 'bg-green-600 text-white'
                    : selectedSize
                    ? 'bg-brand-accent text-white hover:opacity-90'
                    : 'bg-brand-elevated text-brand-muted border border-brand-border cursor-not-allowed'
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      ¡Agregado al carrito!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {selectedSize ? 'Agregar al carrito' : 'Selecciona una talla'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
