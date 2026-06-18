// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { db } from '@/lib/db'
import { Star, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProductReviewsProps {
  productId: string
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de ${max} estrellas`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < rating ? 'fill-brand-gold text-brand-gold' : 'text-brand-border'
          )}
          strokeWidth={i < rating ? 0 : 1.5}
        />
      ))}
    </div>
  )
}

function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs text-brand-muted">
      <span className="w-4 text-right">{rating}</span>
      <Star className="w-3 h-3 text-brand-gold fill-brand-gold shrink-0" />
      <div className="flex-1 h-1.5 bg-brand-border rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right font-mono">{count}</span>
    </div>
  )
}

export async function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, aggregates] = await Promise.all([
    db.review.findMany({
      where: { productId, isApproved: true },
      include: {
        user: { select: { name: true, image: true } },
        images: { take: 4 },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    db.review.groupBy({
      by: ['rating'],
      where: { productId, isApproved: true },
      _count: { rating: true },
    }),
  ])

  const total = reviews.length === 0 ? 0 : await db.review.count({ where: { productId, isApproved: true } })
  const avgRating =
    total > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0

  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const agg of (aggregates as { rating: number; _count: { rating: number } }[])) {
    ratingCounts[agg.rating] = agg._count.rating
  }

  return (
    <section aria-labelledby="reviews-heading" className="mt-16">
      <h2
        id="reviews-heading"
        className="font-display text-xl font-black text-white mb-6 uppercase tracking-tight"
      >
        Reseñas
      </h2>

      {total === 0 ? (
        <div className="border border-brand-border rounded-xl p-8 text-center">
          <p className="text-brand-muted text-sm">
            Todavía no hay reseñas para este producto.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary */}
          <div className="flex flex-col sm:flex-row gap-6 p-5 bg-brand-elevated border border-brand-border rounded-xl">
            <div className="flex flex-col items-center justify-center min-w-[100px]">
              <span className="font-display text-5xl font-black text-white">
                {avgRating.toFixed(1)}
              </span>
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-xs text-brand-muted mt-1">
                {total} {total === 1 ? 'reseña' : 'reseñas'}
              </span>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((r) => (
                <RatingBar
                  key={r}
                  rating={r}
                  count={ratingCounts[r] ?? 0}
                  total={total}
                />
              ))}
            </div>
          </div>

          {/* Individual reviews */}
          <div className="space-y-4">
            {(reviews as typeof reviews).map((review: (typeof reviews)[number]) => (
              <article
                key={review.id}
                className="border border-brand-border rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-elevated border border-brand-border flex items-center justify-center text-xs font-bold text-brand-muted select-none">
                      {review.user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {review.user.name ?? 'Usuario anónimo'}
                      </p>
                      <p className="text-xs text-brand-muted">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StarRating rating={review.rating} />
                    {review.isVerified && (
                      <span className="flex items-center gap-1 text-[10px] text-brand-success font-semibold uppercase tracking-wide">
                        <CheckCircle className="w-3 h-3" />
                        Compra verificada
                      </span>
                    )}
                  </div>
                </div>

                {review.title && (
                  <p className="text-sm font-bold text-white">{review.title}</p>
                )}
                <p className="text-sm text-brand-muted leading-relaxed">
                  {review.body}
                </p>

                {review.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {review.images.map((img: { id: string; url: string }) => (
                      <div
                        key={img.id}
                        className="w-16 h-16 rounded-lg overflow-hidden bg-brand-elevated border border-brand-border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt="Imagen de reseña"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
