// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { formatDate, formatPrice } from '@/lib/utils'
import { CouponCard } from '@/components/store/coupon-card'
import { Tag } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Cupones Activos — SNEAKERSMON HIDALGO',
  description: 'Descubre los cupones de descuento disponibles en SNEAKERSMON HIDALGO. Ahorra en sneakers premium con nuestros códigos exclusivos.',
}

async function getCoupons() {
  return db.coupon.findMany({
    where: {
      isActive: true,
      isPublic: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
      AND: [
        {
          OR: [
            { startsAt: null },
            { startsAt: { lte: new Date() } },
          ],
        },
      ],
    },
    orderBy: [
      { type: 'asc' },
      { value: 'desc' },
    ],
  })
}

export default async function CouponsPage() {
  const coupons = await getCoupons()

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero */}
      <section className="relative border-b border-brand-border bg-brand-surface overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.07)_0%,transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <p className="text-brand-gold font-mono text-xs tracking-[0.3em] mb-4 uppercase">
            Descuentos exclusivos
          </p>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight mb-6">
            CUPONES ACTIVOS
          </h1>
          <p className="text-brand-muted text-lg max-w-xl">
            Usa estos códigos en tu próxima compra y ahorra en los mejores sneakers del mercado.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {coupons.length === 0 ? (
          <div className="bg-brand-elevated border border-brand-border rounded-2xl p-20 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center mx-auto mb-6">
              <Tag className="w-10 h-10 text-brand-muted" />
            </div>
            <h2 className="font-display font-black text-2xl tracking-tight mb-3">
              No hay cupones disponibles
            </h2>
            <p className="text-brand-muted text-base max-w-sm mx-auto">
              Vuelve pronto. Publicamos nuevos cupones y ofertas regularmente.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-brand-muted font-mono text-sm">
                {coupons.length} {coupons.length === 1 ? 'cupón disponible' : 'cupones disponibles'}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(coupons as Array<{
                id: string
                code: string
                description: string | null
                type: string
                value: { toString(): string } | number
                minOrder: { toString(): string } | number | null
                expiresAt: Date | null
                usedCount: number
                maxUses: number | null
              }>).map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  code={coupon.code}
                  description={coupon.description ?? undefined}
                  type={coupon.type}
                  value={Number(coupon.value)}
                  minOrder={coupon.minOrder ? Number(coupon.minOrder) : undefined}
                  expiresAt={coupon.expiresAt ?? undefined}
                  usedCount={coupon.usedCount}
                  maxUses={coupon.maxUses ?? undefined}
                />
              ))}
            </div>

            <p className="text-xs text-brand-muted text-center mt-12">
              Los cupones son de uso único por pedido. No acumulables entre sí salvo indicación expresa.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
