// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import { HeroSection } from '@/components/store/hero-section'
import { FeaturedDropsSection } from '@/components/store/featured-drops-section'
import { NewArrivalsSection } from '@/components/store/new-arrivals-section'
import { BestSellersSection } from '@/components/store/best-sellers-section'
import { CoverageMapSection } from '@/components/store/coverage-map-section'
import { ActiveCouponsSection } from '@/components/store/active-coupons-section'
import { ReviewsSection } from '@/components/store/reviews-section'
import { StoresSection } from '@/components/store/stores-section'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'SNEAKERSMON HIDALGO — Sneakers Premium',
  description: 'Drops exclusivos, ediciones limitadas y entrega directa. La tienda definitiva de sneakers en México.',
}

async function getData() {
  const [drops, newArrivals, bestSellers, coupons] = await Promise.all([
    db.drop.findMany({ where: { status: 'UPCOMING' }, take: 3, orderBy: { releaseDate: 'asc' } }),
    db.product.findMany({
      where: { status: 'ACTIVE', isNewArrival: true },
      take: 8,
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 }, variants: { include: { inventory: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.product.findMany({
      where: { status: 'ACTIVE', isBestSeller: true },
      take: 8,
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 }, variants: { include: { inventory: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    db.coupon.findMany({
      where: { isActive: true, isPublic: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      take: 4,
    }),
  ])

  const mappedDrops = drops.map((d) => ({
    ...d,
    price: d.price !== null ? Number(d.price) : null,
  }))

  const mapProducts = (arr: typeof newArrivals) =>
    arr.map((p) => ({
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice !== null ? Number(p.compareAtPrice) : null,
      variants: p.variants.map((v) => ({
        ...v,
        price: v.price !== null ? Number(v.price) : null,
      })),
    }))

  const mappedCoupons = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    discount: Number(c.value),
    type: c.type,
    expiresAt: c.expiresAt,
    description: c.description,
    minimumAmount: c.minOrder !== null ? Number(c.minOrder) : null,
  }))

  return {
    drops: mappedDrops,
    newArrivals: mapProducts(newArrivals),
    bestSellers: mapProducts(bestSellers),
    coupons: mappedCoupons,
  }
}

export default async function HomePage() {
  const { drops, newArrivals, bestSellers, coupons } = await getData().catch(() => ({
    drops: [], newArrivals: [], bestSellers: [], coupons: [],
  }))
  return (
    <>
      <HeroSection />
      <FeaturedDropsSection drops={drops} />
      <NewArrivalsSection products={newArrivals} />
      <BestSellersSection products={bestSellers} />
      <ActiveCouponsSection coupons={coupons} />
      <StoresSection />
      <CoverageMapSection />
      <ReviewsSection />
    </>
  )
}
