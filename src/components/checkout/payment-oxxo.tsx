'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, AlertCircle, Store } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PaymentOxxoProps {
  orderId: string
  amount: number
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copiado`)
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error('No se pudo copiar') }
  }
  return (
    <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
      <p className="text-brand-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono font-semibold text-sm break-all">{value}</p>
        <button onClick={handleCopy} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-brand-border transition-colors text-brand-muted hover:text-white">
          {copied ? <Check className="w-4 h-4 text-brand-success" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export function PaymentOxxo({ orderId, amount }: PaymentOxxoProps) {
  const [reference] = useState(() => `SNK${orderId.slice(-8).toUpperCase()}`)

  return (
    <div className="space-y-4">
      {/* OXXO header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-[#DC0000]/10 border border-[#DC0000]/30 rounded-xl p-4"
      >
        <div className="w-10 h-10 bg-[#DC0000] rounded-xl flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-white">Pago en OXXO</p>
          <p className="text-xs text-brand-muted">Presenta esta referencia en cualquier tienda OXXO</p>
        </div>
      </motion.div>

      {/* Barcode visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl p-5 flex flex-col items-center gap-3"
      >
        {/* Barcode stripes */}
        <div className="flex items-end gap-[2px] h-16">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="bg-black rounded-sm"
              style={{
                width: i % 3 === 0 ? 3 : i % 5 === 0 ? 4 : 2,
                height: i % 7 === 0 ? 60 : i % 4 === 0 ? 52 : 48,
              }}
            />
          ))}
        </div>
        <p className="font-mono text-black text-sm font-bold tracking-[0.2em]">{reference}</p>
        <p className="text-gray-600 text-xs font-bold">SNEAKERSMON HIDALGO</p>
      </motion.div>

      <CopyField label="Referencia de pago" value={reference} />

      {/* Amount */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
        <p className="text-brand-muted text-xs font-medium uppercase tracking-wider mb-1">Monto a pagar</p>
        <div className="flex items-center justify-between">
          <p className="font-mono font-bold text-2xl text-[#DC0000]">{formatPrice(amount)}</p>
          <span className="text-xs text-brand-muted bg-brand-black px-2 py-1 rounded-lg">MXN</span>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">¿Cómo pagar?</p>
        {[
          { step: '1', text: 'Ve a cualquier tienda OXXO' },
          { step: '2', text: 'Di que quieres hacer un pago de servicio' },
          { step: '3', text: 'Proporciona la referencia al cajero' },
          { step: '4', text: 'Paga el monto exacto en efectivo' },
          { step: '5', text: 'Guarda tu comprobante' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#DC0000] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{step}</span>
            <p className="text-sm text-brand-muted">{text}</p>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
          <div className="text-xs text-brand-muted space-y-1">
            <p>Tienes <strong className="text-white">48 horas</strong> para pagar en OXXO.</p>
            <p>El pago se confirma en <strong className="text-white">1-2 horas</strong> automáticamente.</p>
            <p>Máximo <strong className="text-white">$10,000 MXN</strong> por transacción en OXXO.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
