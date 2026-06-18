// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { Star } from 'lucide-react'

interface Review {
  id: string
  name: string
  rating: number
  body: string
  product: string
  date: string
  avatar?: string
}

const REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Carlos M.',
    rating: 5,
    body: 'Increíble servicio. Las Air Jordan 1 llegaron en caja perfectamente sellada, exactamente como en las fotos. El seguimiento por WhatsApp fue genial.',
    product: 'Air Jordan 1 Retro High OG',
    date: 'Ene 2026',
  },
  {
    id: '2',
    name: 'Sofía R.',
    rating: 5,
    body: 'Compré las Yeezy 350 y llegaron en menos de 2 días a Pachuca. Autenticidad verificada y envueltas con cuidado. Definitivamente vuelvo.',
    product: 'Yeezy Boost 350 V2 "Zebra"',
    date: 'Feb 2026',
  },
  {
    id: '3',
    name: 'Diego L.',
    rating: 5,
    body: 'El cupón de descuento funcionó perfecto. Ahorré bastante en mis New Balance 990v6. La atención al cliente respondió en minutos.',
    product: 'New Balance 990v6 "Grey"',
    date: 'Feb 2026',
  },
  {
    id: '4',
    name: 'Valeria T.',
    rating: 4,
    body: 'Muy buen proceso de compra, el mapa de cobertura en la web me ayudó a saber exactamente cuándo iban a llegar mis tenis. Llegaron puntual.',
    product: 'Nike Dunk Low Retro',
    date: 'Mar 2026',
  },
  {
    id: '5',
    name: 'Andrés P.',
    rating: 5,
    body: 'Ya van tres pares que compro aquí. La edición limitada que tenían no la encontré en ningún otro lado en México. Son confiables al 100%.',
    product: 'Adidas Samba OG "Cloud White"',
    date: 'Mar 2026',
  },
  {
    id: '6',
    name: 'Fernanda G.',
    rating: 5,
    body: 'Las fotos antes del envío me dieron mucha confianza. El empaque premium es un detalle que muestra que cuidan cada pedido. ¡Mis Converse llegaron perfectas!',
    product: 'Converse Chuck 70 "Black"',
    date: 'Abr 2026',
  },
]

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de ${max} estrellas`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating
              ? 'text-brand-gold fill-brand-gold'
              : 'text-brand-border fill-brand-border'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div
      className="flex-shrink-0 w-72 sm:w-80 flex flex-col gap-4 p-5 rounded-[var(--radius-lg)] bg-brand-surface border border-brand-border"
      role="article"
    >
      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Body */}
      <blockquote className="text-sm text-white/80 leading-relaxed flex-1">
        &ldquo;{review.body}&rdquo;
      </blockquote>

      {/* Product */}
      <div
        className="text-[11px] font-semibold tracking-wide text-brand-accent truncate"
        title={review.product}
      >
        {review.product}
      </div>

      {/* Reviewer */}
      <div className="flex items-center justify-between border-t border-brand-border pt-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FF5A1F, #D4AF37)',
            }}
            aria-hidden="true"
          >
            {review.name.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-white">{review.name}</span>
        </div>
        <span className="text-[11px] text-brand-muted">{review.date}</span>
      </div>
    </div>
  )
}

export function ReviewsSection() {
  const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length

  return (
    <section className="py-16 sm:py-24 bg-brand-black border-t border-brand-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              LO QUE DICEN
            </h2>
            <p className="text-brand-muted text-sm mt-1">
              Clientes reales, experiencias reales.
            </p>
          </div>

          {/* Aggregate rating */}
          <div className="flex items-center gap-3 bg-brand-surface rounded-[var(--radius-md)] px-4 py-3 border border-brand-border">
            <div className="text-center">
              <span className="font-display font-black text-3xl text-white">
                {avgRating.toFixed(1)}
              </span>
              <p className="text-[10px] text-brand-muted mt-0.5">de 5.0</p>
            </div>
            <div className="flex flex-col gap-1">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-[11px] text-brand-muted">{REVIEWS.length} reseñas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal scroll — full bleed */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 pb-2">
        {REVIEWS.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
