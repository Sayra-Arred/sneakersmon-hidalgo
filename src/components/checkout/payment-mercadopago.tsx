'use client'
import { useState } from 'react'
import { ExternalLink, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface PaymentMercadoPagoProps {
  orderId: string
  amount: number
}

export function PaymentMercadoPago({ orderId, amount }: PaymentMercadoPagoProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handlePay() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/payments/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al crear la preferencia')
      }

      const data = await res.json()
      const url: string = data.initPoint ?? data.sandboxInitPoint ?? data.init_point

      if (!url) throw new Error('No se recibió URL de pago')

      // Redirect to MercadoPago checkout
      window.location.href = url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      toast.error(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Info card */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 space-y-3">
        <p className="text-sm text-brand-muted leading-relaxed">
          Serás redirigido a MercadoPago para completar tu pago de forma segura. Puedes pagar con:
        </p>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          {[
            'Tarjeta de crédito',
            'Tarjeta de débito',
            'OXXO',
            'Saldo MP',
            'Transferencia',
            'Meses sin intereses',
          ].map((method) => (
            <li key={method} className="flex items-center gap-2 text-brand-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent flex-shrink-0" />
              {method}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 text-brand-muted text-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
        <span>Transacción protegida por MercadoPago. Tu información está segura.</span>
      </div>

      <Button
        onClick={handlePay}
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full bg-[#009ee3] hover:bg-[#007ec3] text-white border-0"
        size="lg"
      >
        <ExternalLink className="w-4 h-4" />
        {isLoading ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
      </Button>

      <p className="text-center text-brand-muted text-xs">
        Al hacer clic serás redirigido al sitio de MercadoPago.
        Una vez completado el pago regresarás automáticamente.
      </p>
    </div>
  )
}
