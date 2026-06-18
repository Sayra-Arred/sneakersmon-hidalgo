'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FloatingElements } from './floating-elements'

const WORD1 = 'SNEAKERS'.split('')
const WORD2 = 'PREMIUM'.split('')
const BEAR_ROW = ['🐻','👟','🐻','👟','🐻','👟','🐻','👟','🐻']
const TICKER_ITEMS = ['🐻 NIKE','👟 JORDAN','🐻 ADIDAS','👟 YEEZY','🐻 NEW BALANCE','👟 CONVERSE','🐻 PUMA','👟 REEBOK']

const EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number]
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

const letter = {
  hidden: { opacity: 0, y: 60, rotateX: -40 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: 0.4 + i * 0.06, duration: 0.6, ease: EASE_OUT },
  }),
}

const word2Letter = {
  hidden: { opacity: 0, scale: 0.4, rotate: -10 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, rotate: 0,
    transition: { delay: 0.9 + i * 0.05, duration: 0.5, ease: EASE_SPRING },
  }),
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Dense bear + sneaker texture */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='5' y='45' font-size='30'%3E🐻%3C/text%3E%3Ctext x='52' y='92' font-size='28'%3E👟%3C/text%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
          opacity: 0.055,
        }}
        aria-hidden="true"
      />

      {/* Gradient over texture */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,90,31,0.18) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 40% at 15% 70%, rgba(212,175,55,0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 40% at 85% 20%, rgba(255,90,31,0.08) 0%, transparent 60%)',
            'linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* 22 floating bears & sneakers */}
      <FloatingElements />

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">
        <div className="text-center w-full max-w-6xl mx-auto">

          {/* Badge */}
          <motion.div
            className="flex justify-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <motion.span
              animate={{ boxShadow: ['0 0 0px rgba(255,90,31,0)', '0 0 20px rgba(255,90,31,0.4)', '0 0 0px rgba(255,90,31,0)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full border text-[10px] sm:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.22em] uppercase cursor-default"
              style={{ color: '#FF5A1F', borderColor: 'rgba(255,90,31,0.45)', background: 'rgba(255,90,31,0.1)' }}
            >
              <span>🐻</span>
              <Zap className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Drop Exclusivo · </span>Temporada 2026
              <span>👟</span>
            </motion.span>
          </motion.div>

          {/* SNEAKERS — letter by letter, perspective */}
          <div className="overflow-hidden mb-0" style={{ perspective: 800 }}>
            <div
              className="flex justify-center font-display font-black leading-[0.85] tracking-tight"
              style={{ fontSize: 'clamp(3.2rem, 14vw, 9rem)' }}
            >
              {WORD1.map((ch, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letter}
                  initial="hidden"
                  animate="visible"
                  className="inline-block gradient-text"
                >
                  {ch}
                </motion.span>
              ))}
            </div>
          </div>

          {/* PREMIUM — spring pop */}
          <div className="overflow-hidden mb-4 sm:mb-6">
            <div
              className="flex justify-center font-display font-black leading-[0.85] tracking-tight text-white"
              style={{ fontSize: 'clamp(3.2rem, 14vw, 9rem)' }}
            >
              {WORD2.map((ch, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={word2Letter}
                  initial="hidden"
                  animate="visible"
                  className="inline-block"
                  whileHover={{ scale: 1.2, color: '#FF5A1F', transition: { duration: 0.15 } }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Bouncing bear + sneaker row — 5 on mobile, 9 on desktop */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            {BEAR_ROW.map((e, i) => (
              <motion.span
                key={i}
                className={`select-none text-xl sm:text-2xl md:text-3xl ${i >= 5 ? 'hidden sm:inline' : ''}`}
                animate={{ y: [0, -10, 0], rotate: [0, i % 2 === 0 ? 12 : -12, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6 + i * 0.1, delay: i * 0.12, repeat: Infinity, ease: 'easeInOut' }}
              >
                {e}
              </motion.span>
            ))}
          </div>

          {/* Subtitle — typewriter feel */}
          <motion.p
            className="text-brand-muted text-xs sm:text-sm font-mono tracking-[0.25em] sm:tracking-[0.35em] uppercase mb-8 sm:mb-10"
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.35em' }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            Hidalgo · CDMX · Querétaro
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link
                href="/catalog"
                className={cn(buttonVariants({ variant: 'primary', size: 'xl' }), 'flex items-center justify-center gap-2 w-full sm:w-auto')}
              >
                🐻 EXPLORAR CATÁLOGO <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
              <Link
                href="/drops"
                className={cn(buttonVariants({ variant: 'outline', size: 'xl' }), 'flex items-center justify-center gap-2 w-full sm:w-auto')}
              >
                👟 VER DROPS
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Ticker strip */}
      <div className="relative z-10 border-t border-brand-border overflow-hidden py-3 sm:py-4 bg-brand-surface/60 backdrop-blur-sm">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 sm:gap-6 px-4 sm:px-6">
              <span className="text-[11px] sm:text-xs font-display font-black tracking-[0.2em] sm:tracking-[0.25em] text-brand-muted">
                {item}
              </span>
              <span className="text-brand-accent text-xs">·</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
