'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getItemCount,
  } = useCartStore()

  const subtotal = getSubtotal()
  const count = getItemCount()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-brand-surface border-l border-brand-border flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-brand-accent" />
                <h2 className="font-display font-bold text-lg">
                  Carrito
                  {count > 0 && (
                    <span className="ml-2 text-sm font-normal text-brand-muted">
                      ({count} {count === 1 ? 'artículo' : 'artículos'})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="p-2 rounded-lg text-brand-muted hover:text-white hover:bg-brand-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-brand-muted" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg mb-1">Tu carrito está vacío</p>
                    <p className="text-sm text-brand-muted">
                      Agrega algunos sneakers para empezar.
                    </p>
                  </div>
                  <Link
                    href="/catalog"
                    onClick={closeCart}
                    className="px-6 py-3 rounded-xl bg-brand-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Ver catálogo
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-brand-border px-6">
                  {items.map((item) => (
                    <li key={item.variantId} className="py-5 flex gap-4">
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-brand-elevated border border-brand-border flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-brand-muted" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-brand-muted uppercase tracking-wider mb-0.5">
                          {item.brand}
                        </p>
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-semibold leading-snug hover:text-brand-accent transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-brand-muted mt-1">
                          Talla: <span className="text-white">{item.size}</span>
                        </p>

                        {/* Price + controls */}
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm font-bold text-brand-accent">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              aria-label="Quitar uno"
                              className="w-7 h-7 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-muted hover:text-white hover:border-brand-accent transition-colors disabled:opacity-40"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              aria-label="Agregar uno"
                              className="w-7 h-7 rounded-lg bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-muted hover:text-white hover:border-brand-accent transition-colors disabled:opacity-40"
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              aria-label="Eliminar artículo"
                              className="w-7 h-7 rounded-lg ml-1 flex items-center justify-center text-brand-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-brand-border px-6 py-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">Subtotal</span>
                  <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-brand-muted">
                  Envío y descuentos calculados al momento del pago.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full py-3.5 rounded-xl bg-brand-accent text-white text-sm font-bold text-center hover:opacity-90 transition-opacity"
                  >
                    Ir al checkout
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full py-3 rounded-xl border border-brand-border text-sm font-semibold text-brand-muted hover:text-white hover:border-white transition-colors"
                  >
                    Seguir comprando
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
