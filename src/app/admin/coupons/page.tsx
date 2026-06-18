// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { formatDate, formatPrice } from '@/lib/utils'
import { Tag } from 'lucide-react'
import { CouponsClient } from './coupons-client'

export const metadata: Metadata = { title: 'Cupones' }
export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { couponUsages: true } },
    },
  })

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.isActive).length,
    expired: coupons.filter((c) => c.expiresAt && new Date(c.expiresAt) < new Date()).length,
    totalUses: coupons.reduce((sum, c) => sum + c.usedCount, 0),
  }

  const serialized = coupons.map((c) => ({
    ...c,
    value: Number(c.value),
    minOrder: c.minOrder != null ? Number(c.minOrder) : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    startsAt: c.startsAt?.toISOString() ?? null,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    usageCount: c._count.couponUsages,
  }))

  return (
    <CouponsClient
      coupons={serialized}
      stats={stats}
      formatDate={formatDate}
      formatPrice={formatPrice}
    />
  )
}
