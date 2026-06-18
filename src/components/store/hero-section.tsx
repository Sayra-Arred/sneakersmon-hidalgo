'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const BRAND_STRIP = ['NIKE', 'JORDAN', 'ADIDAS', 'YEEZY', 'NEW BALANCE', 'CONVERSE']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,90,31,0.12) 0%, rgba(0,0,0,0) 70%), linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-[0.2em] uppercase"
              style={{
                color: '#FF5A1F',
                borderColor: 'rgba(255,90,31,0.35)',
                background: 'rgba(255,90,31,0.08)',
                fontVariant: 'small-caps',
              }}
            >
              <Zap className="w-3 h-3 fill-current" />
              Drop Exclusivo · Temporada 2026
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="font-display font-black leading-[0.9] tracking-tight mb-6"
            style={{ fontSize: 'clamp(4rem, 14vw, 9rem)' }}
          >
            <span className="block gradient-text">SNEAKERS</span>
            <span className="block text-white">PREMIUM</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={itemVariants}
            className="text-brand-muted text-sm sm:text-base font-mono tracking-[0.3em] uppercase mb-10"
          >
            Hidalgo · CDMX · Querétaro
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/catalog"
              className={cn(buttonVariants({ variant: 'primary', size: 'xl' }), 'flex items-center gap-2')}
            >
              EXPLORAR CATÁLOGO
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/drops"
              className={cn(buttonVariants({ variant: 'outline', size: 'xl' }))}
            >
              VER DROPS
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Brand ticker strip */}
      <div className="relative border-t border-brand-border overflow-hidden py-4 bg-brand-surface/50">
        <div className="flex whitespace-nowrap" style={{ animation: 'ticker 24s linear infinite' }}>
          {[...Array(4)].map((_, rep) => (
            <span key={rep} className="flex items-center gap-0">
              {BRAND_STRIP.map((brand) => (
                <span key={brand} className="inline-flex items-center gap-6 px-6">
                  <span className="text-xs font-display font-black tracking-[0.25em] text-brand-muted">
                    {brand}
                  </span>
                  <span className="text-brand-accent text-xs" aria-hidden="true">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`,
        }}
      />
    </section>
  )
}
