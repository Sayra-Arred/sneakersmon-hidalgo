'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ProductCard } from '@/components/store/product-card'
import type { ProductCard as ProductCardType } from '@/types'

interface RawProduct {
  id: string; name: string; slug: string; price: number; compareAtPrice: number | null
  isFeatured: boolean; isLimitedEdition: boolean; isBestSeller: boolean; colorway: string | null
  brand: { id: string; name: string; slug: string }
  images: { url: string; isPrimary: boolean }[]
  variants: { isActive: boolean; size: string; inventory: { quantity: number; reserved: number } | null }[]
}

function toProductCard(p: RawProduct): ProductCardType {
  const active = p.variants.filter(v => v.isActive)
  const availableSizes = active.filter(v => v.inventory && v.inventory.quantity - v.inventory.reserved > 0).map(v => v.size)
  const totalStock = active.reduce((s, v) => s + (v.inventory ? Math.max(0, v.inventory.quantity - v.inventory.reserved) : 0), 0)
  return { id: p.id, name: p.name, slug: p.slug, price: p.price, compareAtPrice: p.compareAtPrice,
    brand: p.brand, isFeatured: p.isFeatured, isLimitedEdition: p.isLimitedEdition, isBestSeller: p.isBestSeller,
    colorway: p.colorway, primaryImage: p.images.find(i => i.isPrimary)?.url ?? p.images[0]?.url ?? null,
    availableSizes, totalStock }
}

const TITLE = 'NUEVOS INGRESOS'.split('')

export function NewArrivalsSection({ products }: { products: RawProduct[] }) {
  const cards = products.map(toProductCard)
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-16 sm:py-24 bg-brand-black overflow-hidden">

      {/* Bear + sneaker texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110'%3E%3Ctext x='8' y='52' font-size='32'%3E🐻%3C/text%3E%3Ctext x='58' y='102' font-size='28'%3E👟%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '110px 110px',
          opacity: 0.04,
        }}
        aria-hidden="true"
      />

      {/* Orange accent glow top-left */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,90,31,0.12) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8 sm:mb-14">
          <div>
            {/* Animated emoji row */}
            <motion.div
              className="flex gap-1.5 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              {['🐻','👟','🐻','👟','🐻'].map((e, i) => (
                <motion.span
                  key={i}
                  className="text-lg sm:text-xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.4, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>

            {/* Letter-by-letter title */}
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight overflow-hidden">
              <span className="flex flex-wrap">
                {TITLE.map((ch, i) => (
                  <motion.span
                    key={i}
                    className={ch === ' ' ? 'inline-block w-3' : 'inline-block'}
                    style={ch !== ' ' ? {
                      background: 'linear-gradient(135deg, #fff 40%, rgba(255,90,31,0.7) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    } : {}}
                    initial={{ opacity: 0, y: 40, rotateX: -45 }}
                    animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                    transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
              {/* Gradient underline */}
              <motion.span
                className="block h-1 rounded-full mt-2"
                style={{ background: 'linear-gradient(90deg, #FF5A1F, #D4AF37, transparent)' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              href="/catalog?sort=newest"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:text-white transition-colors group"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex sm:hidden gap-4 overflow-x-auto no-scrollbar pb-2">
          {cards.length > 0 ? cards.map((p, i) => (
            <motion.div
              key={p.id}
              className="flex-shrink-0 w-48"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
            >
              <ProductCard product={p} priority={i < 2} />
            </motion.div>
          )) : (
            // Empty state with bears
            <div className="flex gap-4">
              {[0,1,2,3].map(i => (
                <div key={i} className="flex-shrink-0 w-48 aspect-square bg-brand-elevated rounded-[var(--radius-lg)] border border-brand-border flex flex-col items-center justify-center gap-2">
                  <motion.span className="text-4xl" animate={{ y: [0,-8,0] }} transition={{ duration: 1.5, delay: i*0.2, repeat: Infinity }}>🐻</motion.span>
                  <span className="text-[11px] text-brand-muted">Próximamente</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {cards.length > 0 ? cards.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={p} priority={i < 4} />
            </motion.div>
          )) : (
            [0,1,2,3].map(i => (
              <div key={i} className="aspect-square bg-brand-elevated rounded-[var(--radius-lg)] border border-brand-border flex flex-col items-center justify-center gap-3">
                <motion.span className="text-5xl" animate={{ y: [0,-10,0], rotate: [0,8,0] }} transition={{ duration: 1.8, delay: i*0.25, repeat: Infinity }}>🐻</motion.span>
                <motion.span className="text-3xl" animate={{ y: [0,6,0] }} transition={{ duration: 1.5, delay: i*0.2+0.3, repeat: Infinity }}>👟</motion.span>
                <span className="text-xs text-brand-muted tracking-widest">PRÓXIMAMENTE</span>
              </div>
            ))
          )}
        </div>

        <div className="flex sm:hidden justify-center mt-6">
          <Link href="/catalog?sort=newest" className="flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:text-white transition-colors">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
