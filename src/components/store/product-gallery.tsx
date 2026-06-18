'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary) return -1
    if (b.isPrimary) return 1
    return a.order - b.order
  })

  const [activeIndex, setActiveIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const activeImage = sorted[activeIndex]

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % sorted.length)
  }, [sorted.length])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length)
  }, [sorted.length])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen, goNext, goPrev])

  // also support arrow navigation outside fullscreen
  useEffect(() => {
    if (fullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen, goNext, goPrev])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-brand-elevated rounded-xl flex items-center justify-center">
        <span className="text-brand-muted text-sm">Sin imágenes</span>
      </div>
    )
  }

  return (
    <>
      {/* Main gallery */}
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div
          className="relative aspect-square bg-brand-elevated rounded-xl overflow-hidden group cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => {
            setIsZoomed(false)
            setMousePos({ x: 50, y: 50 })
          }}
          onMouseMove={handleMouseMove}
          onClick={() => setFullscreen(true)}
          role="button"
          aria-label="Ver imagen en pantalla completa"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setFullscreen(true)}
        >
          <Image
            src={activeImage.url}
            alt={activeImage.altText ?? `${productName} imagen ${activeIndex + 1}`}
            fill
            priority={activeIndex === 0}
            className={cn(
              'object-cover transition-transform duration-300',
              isZoomed ? 'scale-150' : 'scale-100'
            )}
            style={
              isZoomed
                ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
                : undefined
            }
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Zoom indicator */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 glass rounded-lg p-1.5">
            <ZoomIn className="w-4 h-4 text-brand-muted" />
          </div>

          {/* Arrow nav on main image */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                aria-label="Imagen anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 glass rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-brand-elevated"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                aria-label="Imagen siguiente"
                className="absolute right-3 top-1/2 -translate-y-1/2 glass rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-brand-elevated"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Image counter */}
          {sorted.length > 1 && (
            <div className="absolute bottom-3 left-3 glass rounded-full px-2 py-0.5 text-xs text-brand-muted font-mono">
              {activeIndex + 1} / {sorted.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {sorted.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                aria-label={`Ver imagen ${i + 1}`}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                  i === activeIndex
                    ? 'border-brand-accent'
                    : 'border-brand-border hover:border-brand-muted'
                )}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? `${productName} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Galería de imágenes"
        >
          {/* Close button */}
          <button
            onClick={() => setFullscreen(false)}
            aria-label="Cerrar galería"
            className="absolute top-4 right-4 glass rounded-xl p-2 text-brand-muted hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main fullscreen image */}
          <div
            className="relative w-full max-w-3xl max-h-[80vh] aspect-square mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.altText ?? `${productName} imagen ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>

          {/* Arrow buttons */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                aria-label="Imagen anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 glass rounded-xl p-3 text-brand-muted hover:text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                aria-label="Imagen siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 glass rounded-xl p-3 text-brand-muted hover:text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Thumbnails row */}
          {sorted.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {sorted.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  className={cn(
                    'relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200',
                    i === activeIndex
                      ? 'border-brand-accent'
                      : 'border-brand-border opacity-60 hover:opacity-100'
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
