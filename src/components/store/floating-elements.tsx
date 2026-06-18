'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

// On mobile only the 8 edge elements show (no center overlap with text)
const ELEMENTS_MOBILE = [
  { emoji: '🐻', size: 32, x: '1%',  y: '10%', delay: 0,   dur: 6.5, rotate: -12, amp: 14 },
  { emoji: '👟', size: 28, x: '3%',  y: '40%', delay: 1.2, dur: 7,   rotate: 25,  amp: 12 },
  { emoji: '🐻', size: 26, x: '1%',  y: '70%', delay: 2.1, dur: 8,   rotate: 8,   amp: 14 },
  { emoji: '👟', size: 30, x: '2%',  y: '88%', delay: 0.5, dur: 5.5, rotate: -20, amp: 10 },
  { emoji: '👟', size: 30, x: '91%', y: '8%',  delay: 0.3, dur: 7.5, rotate: -18, amp: 14 },
  { emoji: '🐻', size: 28, x: '89%', y: '35%', delay: 1.6, dur: 6,   rotate: 22,  amp: 12 },
  { emoji: '👟', size: 24, x: '92%', y: '65%', delay: 0.9, dur: 8.5, rotate: -8,  amp: 14 },
  { emoji: '🐻', size: 32, x: '88%', y: '85%', delay: 2.4, dur: 7,   rotate: 10,  amp: 10 },
]

const ELEMENTS_DESKTOP = [
  { emoji: '🐻', size: 52, x: '2%',  y: '8%',  delay: 0,    dur: 6.5,  rotate: -12, amp: 20 },
  { emoji: '👟', size: 44, x: '6%',  y: '30%', delay: 1.2,  dur: 7,    rotate: 25,  amp: 16 },
  { emoji: '🐻', size: 38, x: '1%',  y: '55%', delay: 2.1,  dur: 8,    rotate: 8,   amp: 22 },
  { emoji: '👟', size: 60, x: '4%',  y: '75%', delay: 0.5,  dur: 5.5,  rotate: -20, amp: 14 },
  { emoji: '🐻', size: 30, x: '10%', y: '90%', delay: 1.8,  dur: 9,    rotate: 15,  amp: 18 },
  { emoji: '👟', size: 56, x: '92%', y: '6%',  delay: 0.3,  dur: 7.5,  rotate: -18, amp: 20 },
  { emoji: '🐻', size: 42, x: '88%', y: '28%', delay: 1.6,  dur: 6,    rotate: 22,  amp: 15 },
  { emoji: '👟', size: 34, x: '94%', y: '52%', delay: 0.9,  dur: 8.5,  rotate: -8,  amp: 24 },
  { emoji: '🐻', size: 64, x: '86%', y: '70%', delay: 2.4,  dur: 7,    rotate: 10,  amp: 12 },
  { emoji: '👟', size: 28, x: '90%', y: '88%', delay: 0.7,  dur: 6,    rotate: -25, amp: 20 },
  { emoji: '🐻', size: 36, x: '22%', y: '12%', delay: 1.1,  dur: 7.2,  rotate: -5,  amp: 18 },
  { emoji: '👟', size: 48, x: '75%', y: '15%', delay: 2.0,  dur: 6.8,  rotate: 18,  amp: 16 },
  { emoji: '🐻', size: 26, x: '45%', y: '4%',  delay: 0.4,  dur: 8.2,  rotate: -14, amp: 22 },
  { emoji: '👟', size: 40, x: '55%', y: '92%', delay: 1.5,  dur: 7.5,  rotate: 12,  amp: 14 },
  { emoji: '🐻', size: 50, x: '30%', y: '82%', delay: 0.8,  dur: 9.5,  rotate: -18, amp: 20 },
  { emoji: '👟', size: 32, x: '68%', y: '78%', delay: 2.3,  dur: 6.2,  rotate: 28,  amp: 16 },
  { emoji: '🐻', size: 44, x: '20%', y: '50%', delay: 1.7,  dur: 7.8,  rotate: 6,   amp: 18 },
  { emoji: '👟', size: 38, x: '78%', y: '45%', delay: 0.2,  dur: 8.8,  rotate: -22, amp: 22 },
  { emoji: '🐻', size: 56, x: '38%', y: '68%', delay: 2.8,  dur: 6.5,  rotate: 16,  amp: 12 },
  { emoji: '👟', size: 30, x: '62%', y: '35%', delay: 1.3,  dur: 7.2,  rotate: -10, amp: 20 },
  { emoji: '🐻', size: 42, x: '50%', y: '58%', delay: 3.0,  dur: 8,    rotate: 20,  amp: 16 },
  { emoji: '👟', size: 52, x: '15%', y: '22%', delay: 0.6,  dur: 9,    rotate: -16, amp: 18 },
]

export function FloatingElements() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!mounted) return null

  const elements = isMobile ? ELEMENTS_MOBILE : ELEMENTS_DESKTOP

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{ left: el.x, top: el.y, fontSize: el.size }}
          initial={{ opacity: 0, scale: 0.3, rotate: el.rotate - 20 }}
          animate={{
            opacity: isMobile ? [0.05, 0.15, 0.05] : [0.07, 0.22, 0.07],
            scale: [0.88, 1.12, 0.88],
            y: [0, -el.amp, 0],
            rotate: [el.rotate, el.rotate + 12, el.rotate],
          }}
          transition={{
            delay: el.delay,
            duration: el.dur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {el.emoji}
        </motion.div>
      ))}
    </div>
  )
}
