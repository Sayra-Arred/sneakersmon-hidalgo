'use client'
import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SpeiDetails {
  clabe: string
  reference: string
  amount: number
  bank: string
  expiresAt: string | Date
}

interface PaymentSpeiProps {
  orderId: string
  onPaid?: () => void
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copiado`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
      <p className="text-brand-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono font-semibold text-sm break-all">{value}</p>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-brand-border transition-colors text-brand-muted hover:text-white"
          aria-label={`Copiar ${label}`}
        >
          {copied ? (
            <Check className="w-4 h-4 text-brand-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export function PaymentSpei({ orderId, onPaid }: PaymentSpeiProps) {
  const [details, setDetails] = useState<SpeiDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PENDING')
  const [pollCount, setPollCount] = useState(0)

  // Load SPEI details
  useEffect(() => {
    async function loadSpei() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/payments/spei', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        if (!res.ok) throw new Error('Error al obtener datos SPEI')
        const data = await res.json()
        setDetails(data.data)
      } catch {
        toast.error('Error al cargar datos de transferencia')
      } finally {
        setIsLoading(false)
      }
    }
    loadSpei()
  }, [orderId])

  // Generate QR code
  useEffect(() => {
    if (!details) return

    async function generateQr() {
      try {
        const QRCode = (await import('qrcode')).default
        const qrContent = [
          `BEN:${details!.bank}`,
          `CLABE:${details!.clabe}`,
          `REF:${details!.reference}`,
          `MONTO:${details!.amount}`,
        ].join('|')
        const url = await QRCode.toDataURL(qrContent, {
          width: 200,
          margin: 2,
          color: { dark: '#ffffff', light: '#121212' },
        })
        setQrDataUrl(url)
      } catch {
        // QR generation is optional, fail silently
      }
    }
    generateQr()
  }, [details])

  // Poll payment status every 30 seconds
  const checkStatus = useCallback(async () => {
    if (paymentStatus === 'PAID') return
    try {
      const res = await fetch(`/api/payments/spei/status?orderId=${orderId}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.data?.paymentStatus === 'PAID') {
        setPaymentStatus('PAID')
        toast.success('¡Transferencia recibida! Tu pedido está confirmado.')
        onPaid?.()
      }
    } catch {
      // Silent fail on poll
    }
    setPollCount((c) => c + 1)
  }, [orderId, paymentStatus, onPaid])

  useEffect(() => {
    if (paymentStatus === 'PAID') return
    const interval = setInterval(checkStatus, 30_000)
    return () => clearInterval(interval)
  }, [checkStatus, paymentStatus])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <RefreshCw className="w-6 h-6 text-brand-accent animate-spin" />
        <p className="text-brand-muted text-sm">Generando datos de transferencia...</p>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="flex items-center gap-3 bg-brand-error/10 border border-brand-error/20 rounded-xl p-4">
        <AlertCircle className="w-5 h-5 text-brand-error flex-shrink-0" />
        <p className="text-sm text-brand-error">No se pudieron cargar los datos de transferencia. Intenta de nuevo.</p>
      </div>
    )
  }

  if (paymentStatus === 'PAID') {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-success/20 flex items-center justify-center">
          <Check className="w-8 h-8 text-brand-success" />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-brand-success">¡Transferencia recibida!</p>
          <p className="text-brand-muted text-sm mt-1">Tu pedido ha sido confirmado y está en proceso.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Monitoring status */}
      <div className="flex items-center gap-3 bg-brand-elevated border border-brand-border rounded-xl px-4 py-3">
        <div className="relative flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-brand-accent animate-ping opacity-75" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Monitoreando transferencia...</p>
          <p className="text-brand-muted text-xs">
            Verificando automáticamente cada 30 segundos
            {pollCount > 0 && ` · ${pollCount} verificaciones`}
          </p>
        </div>
        <button
          onClick={checkStatus}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-brand-border transition-colors text-brand-muted hover:text-white"
          aria-label="Verificar ahora"
          title="Verificar ahora"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Transfer data fields */}
      <CopyField label="Banco" value={details.bank} />
      <CopyField label="CLABE" value={details.clabe} />
      <CopyField label="Referencia" value={details.reference} />

      <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
        <p className="text-brand-muted text-xs font-medium uppercase tracking-wider mb-1">Monto exacto</p>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono font-bold text-xl text-brand-accent">{formatPrice(details.amount)}</p>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(details.amount.toFixed(2))
                toast.success('Monto copiado')
              } catch {
                toast.error('No se pudo copiar')
              }
            }}
            className="p-1.5 rounded-lg hover:bg-brand-border transition-colors text-brand-muted hover:text-white"
            aria-label="Copiar monto"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <p className="text-brand-error text-xs mt-1">
          ⚠ Transfiere exactamente este monto para evitar rechazos
        </p>
      </div>

      {/* QR Code */}
      {qrDataUrl && (
        <div className="flex flex-col items-center gap-3 bg-brand-elevated border border-brand-border rounded-xl p-5">
          <p className="text-brand-muted text-xs font-medium uppercase tracking-wider">Código QR</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR SPEI" width={160} height={160} className="rounded-lg" />
          <p className="text-brand-muted text-xs text-center">
            Escanea con tu app bancaria para prellenar los datos
          </p>
        </div>
      )}

      {/* Warning */}
      <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
          <div className="text-xs text-brand-muted space-y-1">
            <p>Tienes <strong className="text-white">72 horas</strong> para realizar la transferencia.</p>
            <p>La transferencia puede tardar hasta <strong className="text-white">1 hora</strong> en reflejarse.</p>
            <p>Usa exactamente la referencia y el monto indicados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
