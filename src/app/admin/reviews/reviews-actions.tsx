'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ReviewActionsProps {
  reviewId: string
  isApproved: boolean
}

export function ReviewActions({ reviewId, isApproved }: ReviewActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !isApproved }),
      })
      if (!res.ok) throw new Error()
      toast.success(isApproved ? 'Reseña ocultada' : 'Reseña aprobada')
      router.refresh()
    } catch {
      toast.error('Error al actualizar la reseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
        isApproved
          ? 'bg-brand-error/10 text-brand-error hover:bg-brand-error/20'
          : 'bg-brand-success/10 text-brand-success hover:bg-brand-success/20'
      }`}
    >
      {isApproved ? (
        <><XCircle className="w-3.5 h-3.5" />Ocultar</>
      ) : (
        <><CheckCircle className="w-3.5 h-3.5" />Aprobar</>
      )}
    </button>
  )
}
