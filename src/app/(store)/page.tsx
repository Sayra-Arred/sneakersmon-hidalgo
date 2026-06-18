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

export const metadata: Metadata = {
  title: 'SNEAKERSMON HIDALGO — Sneakers Premium',
  description: 'Drops exclusivos, ediciones limitadas y entrega directa. La tienda definitiva de sneakers en México.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedDropsSection drops={[]} />
      <NewArrivalsSection products={[]} />
      <BestSellersSection products={[]} />
      <ActiveCouponsSection coupons={[]} />
      <StoresSection />
      <CoverageMapSection />
      <ReviewsSection />
    </>
  )
}
