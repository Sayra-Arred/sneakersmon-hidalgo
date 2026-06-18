'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Image from 'next/image'
import Link from 'next/link'
import { useWishlistStore } from '@/store/wishlist-store'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Heart, ShoppingBag, X, ArrowRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  function handleAddToCart(item: typeof items[number]) {
    addItem({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      slug: item.slug,
      brand: item.brand,
      size: item.size,
      price: item.price,
      image: item.image,
      maxQuantity: 10,
    })
    toast.success(`${item.name} añadido al carrito`)
  }

  function handleRemove(variantId: string, name: string) {
    removeItem(variantId)
    toast(`${name} eliminado de tu lista`, { icon: '🗑️' })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-full bg-brand-elevated border border-brand-border flex items-center justify-center mb-8">
          <Heart className="w-12 h-12 text-brand-muted" />
        </div>
        <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight mb-4">
          Tu lista está vacía
        </h1>
        <p className="text-brand-muted text-lg max-w-sm mb-8">
          Guarda los sneakers que te interesan y encuéntralos aquí cuando estés listo.
        </p>
        <Link href="/catalog">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explorar catálogo
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Header */}
      <section className="border-b border-brand-border bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-brand-accent font-mono text-xs tracking-[0.3em] mb-2 uppercase">
                Tu colección
              </p>
              <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">
                LISTA DE DESEOS
              </h1>
              <p className="text-brand-muted mt-2">
                {items.length} {items.length === 1 ? 'artículo guardado' : 'artículos guardados'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearWishlist()
                toast('Lista vaciada', { icon: '🗑️' })
              }}
              leftIcon={<Trash2 className="w-4 h-4" />}
              className="text-brand-muted hover:text-brand-error shrink-0"
            >
              Vaciar lista
            </Button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="group bg-brand-elevated border border-brand-border rounded-2xl overflow-hidden hover:border-brand-accent/30 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-brand-surface">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-brand-border/30 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-brand-border" />
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.variantId, item.name)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-brand-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-error text-white"
                  aria-label="Eliminar de lista de deseos"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-brand-muted font-medium uppercase tracking-wide">
                    {item.brand}
                  </p>
                  <Link
                    href={`/catalog/${item.slug}`}
                    className="font-semibold text-sm leading-tight line-clamp-2 mt-0.5 hover:text-brand-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                  {item.size && (
                    <p className="text-xs text-brand-muted mt-1">Talla: {item.size}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-brand-accent">
                    {formatPrice(item.price)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                    leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs"
                  >
                    Agregar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(item.variantId, item.name)}
                    aria-label="Eliminar"
                    className="text-brand-muted hover:text-brand-error shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue shopping */}
        <div className="text-center mt-12">
          <Link href="/catalog">
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Seguir explorando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
