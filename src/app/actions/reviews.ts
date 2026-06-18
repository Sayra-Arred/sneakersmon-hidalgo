// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
'use server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviewSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'

export async function createReview(data: unknown): Promise<ActionResult> {
  const session = await auth()
  if (!session) return { success: false, error: 'No autorizado' }

  const parsed = reviewSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const hasOrdered = await db.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: { userId: session.user.id, paymentStatus: 'PAID' },
    },
  })

  const review = await db.review.create({
    data: {
      userId: session.user.id,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      isVerified: !!hasOrdered,
      isApproved: false,
    },
  })

  revalidatePath(`/product`)
  return { success: true, data: review }
}

export async function approveReview(reviewId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'No autorizado' }
  }

  await db.review.update({ where: { id: reviewId }, data: { isApproved: true } })
  revalidatePath('/admin/reviews')
  return { success: true }
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'No autorizado' }
  }

  await db.review.delete({ where: { id: reviewId } })
  revalidatePath('/admin/reviews')
  return { success: true }
}
