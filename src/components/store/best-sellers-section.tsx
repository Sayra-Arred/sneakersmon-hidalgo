'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
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

const TITLE = 'MÁS VENDIDOS'.split('')

export function BestSellersSection({ products }: { products: RawProduct[] }) {
  const cards = products.map(toProductCard)
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-16 sm:py-24 bg-brand-surface overflow-hidden">

      {/* Bear + sneaker texture (gold tint) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='6' y='48' font-size='30'%3E🐻%3C/text%3E%3Ctext x='54' y='94' font-size='26'%3E👟%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
          opacity: 0.045,
        }}
        aria-hidden="true"
      />

      {/* Gold glow top-right */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.13) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-14">
          <div>
            <motion.div
              className="flex items-center gap-2 mb-2"
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              <TrendingUp className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-bold tracking-widest uppercase text-brand-gold">Los más populares</span>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-base"
              >
                🔥
              </motion.span>
            </motion.div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight overflow-hidden">
              <span className="flex flex-wrap">
                {TITLE.map((ch, i) => (
                  <motion.span
                    key={i}
                    className={ch === ' ' ? 'inline-block w-3' : 'inline-block'}
                    style={ch !== ' ' ? {
                      background: 'linear-gradient(135deg, #D4AF37 0%, #fff 50%, #D4AF37 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    } : {}}
                    initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                    animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                    transition={{ delay: 0.1 + i * 0.045, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
              <motion.span
                className="block h-1 rounded-full mt-2"
                style={{ background: 'linear-gradient(90deg, #D4AF37, #FF5A1F, transparent)' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </h2>

            {/* Dancing emojis */}
            <motion.div
              className="flex gap-2 mt-3"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              {['👟','🐻','👟','🐻','👟'].map((e, i) => (
                <motion.span
                  key={i}
                  className="text-lg sm:text-xl"
                  animate={{ y: [0, -7, 0], rotate: [0, i % 2 ? 10 : -10, 0] }}
                  transition={{ duration: 1.5, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              href="/catalog?sort=popular"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-gold hover:text-white transition-colors group"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden gap-4 overflow-x-auto no-scrollbar pb-2">
          {cards.length > 0 ? cards.map((p, i) => (
            <motion.div key={p.id} className="flex-shrink-0 w-48"
              initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08 }}>
              <ProductCard product={p} priority={i < 2} />
            </motion.div>
          )) : [0,1,2,3].map(i => (
            <div key={i} className="flex-shrink-0 w-48 aspect-square bg-brand-elevated rounded-[var(--radius-lg)] border border-brand-border flex flex-col items-center justify-center gap-2">
              <motion.span className="text-4xl" animate={{ y: [0,-8,0], rotate: [0,10,0] }} transition={{ duration: 1.5, delay: i*0.2, repeat: Infinity }}>🐻</motion.span>
              <span className="text-xs text-brand-muted">Próximamente</span>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {cards.length > 0 ? cards.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <ProductCard product={p} priority={i < 4} />
            </motion.div>
          )) : [0,1,2,3].map(i => (
            <div key={i} className="aspect-square bg-brand-elevated rounded-[var(--radius-lg)] border border-brand-border flex flex-col items-center justify-center gap-3">
              <motion.span className="text-5xl" animate={{ y: [0,-10,0], rotate: [0,-8,0] }} transition={{ duration: 1.8, delay: i*0.25, repeat: Infinity }}>🐻</motion.span>
              <motion.span className="text-3xl" animate={{ y: [0,6,0] }} transition={{ duration: 1.5, delay: i*0.2+0.3, repeat: Infinity }}>👟</motion.span>
              <span className="text-xs text-brand-muted tracking-widest">PRÓXIMAMENTE</span>
            </div>
          ))}
        </div>

        <div className="flex sm:hidden justify-center mt-6">
          <Link href="/catalog?sort=popular" className="flex items-center gap-1.5 text-sm font-semibold text-brand-gold hover:text-white transition-colors">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
