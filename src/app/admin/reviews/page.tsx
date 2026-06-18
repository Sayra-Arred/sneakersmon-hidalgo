// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import Image from 'next/image'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Star, CheckCircle, XCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReviewActions } from './reviews-actions'

export const metadata: Metadata = { title: 'Reseñas' }
export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, image: true } },
      product: { select: { name: true, slug: true } },
    },
    take: 100,
  })

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => !r.isApproved).length,
    approved: reviews.filter((r) => r.isApproved).length,
    verified: reviews.filter((r) => r.isVerified).length,
    avgRating: reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '—',
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Reseñas</h1>
        <p className="text-brand-muted text-sm mt-1">{reviews.length} reseñas en total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Pendientes', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Aprobadas', value: stats.approved, color: 'text-brand-success' },
          { label: 'Verificadas', value: stats.verified, color: 'text-blue-400' },
          { label: 'Rating prom.', value: stats.avgRating, color: 'text-brand-gold' },
        ].map((s) => (
          <div key={s.label} className="bg-brand-elevated border border-brand-border rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-brand-muted font-medium">{s.label}</p>
            <p className={cn('text-2xl font-display font-bold mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={cn(
              'bg-brand-elevated border rounded-xl p-5',
              review.isApproved ? 'border-brand-border' : 'border-yellow-500/30'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-brand-border overflow-hidden flex-shrink-0">
                  {review.user.image ? (
                    <Image src={review.user.image} alt={review.user.name ?? ''} width={36} height={36} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs font-bold">
                      {review.user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-white">{review.user.name ?? review.user.email}</span>
                    {review.isVerified && (
                      <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-semibold">
                        <ShieldCheck className="w-3 h-3" />VERIFICADO
                      </span>
                    )}
                    {review.isApproved ? (
                      <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-brand-success/20 text-brand-success rounded font-semibold">
                        <CheckCircle className="w-3 h-3" />APROBADA
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-semibold">
                        PENDIENTE
                      </span>
                    )}
                  </div>
                  <p className="text-brand-muted text-xs mt-0.5">
                    {review.product.name} · {formatDate(review.createdAt)}
                  </p>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn('w-3.5 h-3.5', i < review.rating ? 'text-brand-gold fill-brand-gold' : 'text-brand-border')}
                      />
                    ))}
                    <span className="text-xs text-brand-muted ml-1">{review.rating}/5</span>
                  </div>

                  {review.title && (
                    <p className="font-semibold text-sm text-white mt-2">{review.title}</p>
                  )}
                  <p className="text-brand-muted text-sm mt-1 leading-relaxed line-clamp-3">{review.body}</p>
                </div>
              </div>

              <ReviewActions reviewId={review.id} isApproved={review.isApproved} />
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="py-16 text-center text-brand-muted bg-brand-elevated border border-brand-border rounded-xl">
            No hay reseñas registradas todavía
          </div>
        )}
      </div>
    </div>
  )
}
