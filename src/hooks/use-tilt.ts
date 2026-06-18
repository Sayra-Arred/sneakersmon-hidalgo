'use client'
import { useRef, useState, useCallback } from 'react'

export function useTilt(maxDeg = 18) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState({
    transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
    transition: 'transform 0.08s linear',
  })
  const [glow, setGlow] = useState({ x: 0, y: 0, opacity: 0 })

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    setStyle({
      transform: `perspective(900px) rotateX(${-y * maxDeg}deg) rotateY(${x * maxDeg}deg) scale3d(1.04,1.04,1.04)`,
      transition: 'transform 0.08s linear',
    })
    setGlow({ x: e.clientX - left, y: e.clientY - top, opacity: 1 })
  }, [maxDeg])

  const onLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
      transition: 'transform 0.45s cubic-bezier(0.23,1,0.32,1)',
    })
    setGlow(g => ({ ...g, opacity: 0 }))
  }, [])

  return { ref, style, glow, onMove, onLeave }
}
