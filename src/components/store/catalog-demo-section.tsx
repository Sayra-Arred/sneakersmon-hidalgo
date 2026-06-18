'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'
import { demoProducts } from './demo-products'
import type { DemoProduct } from './demo-products'
import { QuickBuyDrawer } from './quick-buy-drawer'

const TITLE = 'CATÁLOGO'.split('')

const FILTERS = ['Todos', 'Nike', 'Jordan', 'Adidas', 'New Balance', 'Otros'] as const
type Filter = (typeof FILTERS)[number]

const formatPrice = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 })

function filterProducts(filter: Filter): DemoProduct[] {
  if (filter === 'Todos') return demoProducts
  if (filter === 'Otros') return demoProducts.filter((p) => !['Nike', 'Jordan', 'Adidas', 'New Balance'].includes(p.brand))
  return demoProducts.filter((p) => p.brand === filter)
}

interface ProductCardDemoProps {
  product: DemoProduct
  index: number
  inView: boolean
  onSelect: (p: DemoProduct) => void
}

function ProductCardDemo({ product, index, inView, onSelect }: ProductCardDemoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="group relative flex flex-col bg-brand-elevated border border-brand-border rounded-[var(--radius-lg)] overflow-hidden cursor-pointer hover:border-brand-accent transition-colors duration-200"
      onClick={() => onSelect(product)}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isNew && (
          <span className="px-2 py-0.5 rounded-full bg-brand-accent text-white text-[10px] font-bold tracking-wider">
            NUEVO
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold tracking-wider">
            TOP VENTAS
          </span>
        )}
      </div>

      {/* Emoji area */}
      <div className="relative flex items-center justify-center h-36 sm:h-40 bg-brand-surface">
        <motion.span
          className="text-6xl sm:text-7xl select-none"
          whileHover={{ y: -8, rotate: 5 }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.15 }}
        >
          {product.emoji}
        </motion.span>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <p className="text-[10px] font-bold tracking-widest uppercase text-brand-muted">
          {product.brand}
        </p>
        <p className="text-sm font-bold leading-snug line-clamp-2 text-brand-white">
          {product.name}
        </p>
        <p className="text-xs text-brand-muted mt-0.5">{product.color}</p>
        <p className="text-sm font-bold text-brand-accent mt-1">
          {formatPrice(product.price)}
        </p>

        <button
          onClick={(e) => { e.stopPropagation(); onSelect(product) }}
          className="mt-3 w-full py-2 rounded-lg border border-brand-border text-xs font-bold tracking-wide uppercase text-brand-muted hover:border-brand-accent hover:text-brand-accent hover:bg-brand-surface transition-all duration-150"
        >
          Seleccionar talla
        </button>
      </div>
    </motion.div>
  )
}

export function CatalogDemoSection() {
  const [activeFilter, setActiveFilter] = useState<Filter>('Todos')
  const [selectedProduct, setSelectedProduct] = useState<DemoProduct | null>(null)
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const filtered = filterProducts(activeFilter)

  return (
    <>
      <section ref={ref} className="relative py-16 sm:py-24 bg-brand-black overflow-hidden">
        {/* Bear + sneaker texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='6' y='48' font-size='30'%3E🐻%3C/text%3E%3Ctext x='54' y='94' font-size='26'%3E👟%3C/text%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
            opacity: 0.04,
          }}
          aria-hidden="true"
        />

        {/* Accent glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-60 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(255,90,31,0.08) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <motion.div
              className="flex items-center gap-2 mb-3"
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              <span className="text-xs font-bold tracking-widest uppercase text-brand-accent">
                Todos los modelos
              </span>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-base"
              >
                👟
              </motion.span>
            </motion.div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight overflow-hidden">
              <span className="flex flex-wrap">
                {TITLE.map((ch, i) => (
                  <motion.span
                    key={i}
                    className={ch === ' ' ? 'inline-block w-3' : 'inline-block'}
                    style={
                      ch !== ' '
                        ? {
                            background: 'linear-gradient(135deg, #FF5A1F 0%, #fff 50%, #FF5A1F 100%)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }
                        : {}
                    }
                    initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                    animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                    transition={{ delay: 0.1 + i * 0.045, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
              <motion.span
                className="block h-1 rounded-full mt-2"
                style={{ background: 'linear-gradient(90deg, #FF5A1F, #D4AF37, transparent)' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.65, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              />
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap mb-8">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-150 border',
                  activeFilter === f
                    ? 'bg-brand-accent border-brand-accent text-white'
                    : 'border-brand-border text-brand-muted hover:border-brand-accent hover:text-brand-accent bg-transparent'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => (
              <ProductCardDemo
                key={product.id}
                product={product}
                index={i}
                inView={inView}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      <QuickBuyDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}
