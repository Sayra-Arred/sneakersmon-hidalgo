'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/app/actions/orders'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { ChevronDown, Truck, X } from 'lucide-react'
import type { OrderStatus } from '@/types'

interface OrderActionsProps {
  orderId: string
  currentStatus: OrderStatus
  trackingNumber: string | null
  allStatuses: OrderStatus[]
}

export function OrderActions({ orderId, currentStatus, trackingNumber, allStatuses }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showShipModal, setShowShipModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [trackingInput, setTrackingInput] = useState(trackingNumber ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleStatusChange = (status: OrderStatus) => {
    if (status === currentStatus) {
      setShowStatusDropdown(false)
      return
    }
    if (status === 'SHIPPED') {
      setShowStatusDropdown(false)
      setShowShipModal(true)
      return
    }
    if (status === 'CANCELLED') {
      setShowStatusDropdown(false)
      setShowCancelModal(true)
      return
    }
    setShowStatusDropdown(false)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status)
      if (result.success) {
        setSuccess(`Estado actualizado a ${status}`)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error ?? 'Error al actualizar')
        setTimeout(() => setError(null), 4000)
      }
    })
  }

  const handleMarkShipped = () => {
    if (!trackingInput.trim()) {
      setError('El número de rastreo es requerido')
      return
    }
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, 'SHIPPED', trackingInput.trim())
      if (result.success) {
        setShowShipModal(false)
        setSuccess('Pedido marcado como enviado')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error ?? 'Error al marcar como enviado')
        setTimeout(() => setError(null), 4000)
      }
    })
  }

  const handleCancel = () => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, 'CANCELLED')
      if (result.success) {
        setShowCancelModal(false)
        setSuccess('Pedido cancelado')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error ?? 'Error al cancelar')
        setTimeout(() => setError(null), 4000)
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Feedback messages */}
        {error && (
          <span className="text-xs text-brand-error bg-brand-error/10 px-3 py-1.5 rounded-lg border border-brand-error/20">
            {error}
          </span>
        )}
        {success && (
          <span className="text-xs text-brand-success bg-brand-success/10 px-3 py-1.5 rounded-lg border border-brand-success/20">
            {success}
          </span>
        )}

        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown((v) => !v)}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-brand-border bg-brand-elevated text-sm text-white hover:border-brand-accent transition-colors disabled:opacity-50"
          >
            <OrderStatusBadge status={currentStatus} />
            <ChevronDown className="w-3.5 h-3.5 text-brand-muted" />
          </button>

          {showStatusDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowStatusDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 bg-brand-surface border border-brand-border rounded-xl shadow-modal overflow-hidden min-w-[160px]">
                {allStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-elevated transition-colors flex items-center gap-2 ${
                      s === currentStatus ? 'opacity-50 cursor-default' : ''
                    }`}
                  >
                    <OrderStatusBadge status={s} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick action: mark shipped */}
        {!['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(currentStatus) && (
          <button
            onClick={() => setShowShipModal(true)}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-colors disabled:opacity-50"
          >
            <Truck className="w-4 h-4" />
            Marcar enviado
          </button>
        )}

        {/* Cancel */}
        {!['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(currentStatus) && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-brand-error/10 border border-brand-error/20 text-brand-error text-sm font-medium hover:bg-brand-error/20 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        )}
      </div>

      {/* Ship modal */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowShipModal(false)} />
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-modal">
            <h3 className="font-display font-bold text-white text-lg mb-1">Marcar como enviado</h3>
            <p className="text-brand-muted text-sm mb-5">Ingresa el número de rastreo del paquete.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Número de rastreo
                </label>
                <input
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Ej: 1Z999AA10123456784"
                  className="w-full h-10 rounded-lg bg-brand-elevated border border-brand-border px-4 text-white text-sm font-mono placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleMarkShipped}
                  disabled={isPending}
                  className="flex-1 h-10 rounded-lg bg-brand-accent text-white font-semibold text-sm hover:bg-[#e04d18] transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : 'Confirmar envío'}
                </button>
                <button
                  onClick={() => setShowShipModal(false)}
                  className="h-10 px-4 rounded-lg border border-brand-border text-brand-muted text-sm hover:text-white hover:border-brand-muted transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl p-6 w-full max-w-md shadow-modal">
            <h3 className="font-display font-bold text-white text-lg mb-1">Cancelar pedido</h3>
            <p className="text-brand-muted text-sm mb-5">
              Esta acción cancelará el pedido. El inventario reservado será liberado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1 h-10 rounded-lg bg-brand-error text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Cancelando...' : 'Sí, cancelar pedido'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="h-10 px-4 rounded-lg border border-brand-border text-brand-muted text-sm hover:text-white hover:border-brand-muted transition-colors"
              >
                No, mantener
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
