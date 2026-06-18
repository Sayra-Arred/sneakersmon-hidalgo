'use client'
import { useState } from 'react'
import { Copy, Check, AlertCircle, Building2, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PaymentBankTransferProps {
  orderId: string
  amount: number
  onPaid?: () => void
}

const BANK_ACCOUNTS = [
  {
    bank: 'BBVA Bancomer',
    color: '#004FB6',
    logo: '🔵',
    clabe: '012180012345678901',
    account: '0123456789',
    holder: 'SNEAKERSMON HIDALGO SA DE CV',
  },
  {
    bank: 'Banamex (Citibanamex)',
    color: '#C8102E',
    logo: '🔴',
    clabe: '002180012345678901',
    account: '9876543210',
    holder: 'SNEAKERSMON HIDALGO SA DE CV',
  },
  {
    bank: 'HSBC México',
    color: '#DB0011',
    logo: '🟥',
    clabe: '021180012345678901',
    account: '5544332211',
    holder: 'SNEAKERSMON HIDALGO SA DE CV',
  },
]

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
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-brand-border last:border-0">
      <div>
        <p className="text-brand-muted text-[11px] uppercase tracking-wider">{label}</p>
        <p className="font-mono text-sm font-semibold text-white mt-0.5">{value}</p>
      </div>
      <button onClick={handleCopy} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-brand-border transition-colors text-brand-muted hover:text-white">
        {copied ? <Check className="w-4 h-4 text-brand-success" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}

export function PaymentBankTransfer({ orderId, amount, onPaid }: PaymentBankTransferProps) {
  const [selectedBank, setSelectedBank] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const reference = `SNK-${orderId.slice(-6).toUpperCase()}`
  const bank = BANK_ACCOUNTS[selectedBank]

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-brand-success/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-brand-success" />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg text-brand-success">¡Transferencia notificada!</p>
          <p className="text-brand-muted text-sm mt-1">Verificaremos tu pago en un máximo de 2 horas hábiles.</p>
          <p className="text-brand-muted text-sm">Te avisaremos por WhatsApp cuando se confirme.</p>
        </div>
        <button onClick={onPaid} className="mt-2 text-sm text-brand-accent hover:text-white transition-colors underline">
          Ver mi pedido
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4"
      >
        <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-brand-gold" />
        </div>
        <div>
          <p className="font-bold text-sm text-white">Transferencia bancaria directa</p>
          <p className="text-xs text-brand-muted">SPEI, depósito o transferencia — cualquier banco</p>
        </div>
      </motion.div>

      {/* Bank selector */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Elige tu banco destino</p>
        <div className="grid grid-cols-3 gap-2">
          {BANK_ACCOUNTS.map((b, i) => (
            <button
              key={b.bank}
              onClick={() => setSelectedBank(i)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedBank === i
                  ? 'border-brand-accent bg-brand-accent/10'
                  : 'border-brand-border bg-brand-elevated hover:border-brand-accent/40'
              }`}
            >
              <span className="text-2xl block mb-1">{b.logo}</span>
              <span className="text-[11px] font-semibold text-white leading-tight line-clamp-2">{b.bank}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Account details */}
      <motion.div
        key={selectedBank}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-brand-elevated border border-brand-border rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-brand-border">
          <span className="text-xl">{bank.logo}</span>
          <p className="font-bold text-sm text-white">{bank.bank}</p>
        </div>
        <CopyField label="Titular" value={bank.holder} />
        <CopyField label="CLABE Interbancaria" value={bank.clabe} />
        <CopyField label="No. de cuenta" value={bank.account} />
        <CopyField label="Referencia" value={reference} />
      </motion.div>

      {/* Amount */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
        <p className="text-brand-muted text-xs font-medium uppercase tracking-wider mb-1">Monto exacto a transferir</p>
        <div className="flex items-center justify-between">
          <p className="font-mono font-bold text-2xl text-brand-gold">{formatPrice(amount)}</p>
          <button
            onClick={async () => {
              try { await navigator.clipboard.writeText(amount.toFixed(2)); toast.success('Monto copiado') }
              catch { toast.error('No se pudo copiar') }
            }}
            className="p-1.5 rounded-lg hover:bg-brand-border transition-colors text-brand-muted hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <p className="text-brand-error text-xs mt-1">⚠ Transfiere exactamente este monto e incluye la referencia</p>
      </div>

      {/* Confirm button */}
      <button
        onClick={() => setConfirmed(true)}
        className="w-full py-3 rounded-xl bg-brand-gold text-black font-bold text-sm tracking-wide hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        Ya realicé la transferencia
      </button>

      {/* Warning */}
      <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-brand-muted flex-shrink-0 mt-0.5" />
          <div className="text-xs text-brand-muted space-y-1">
            <p>Tienes <strong className="text-white">72 horas</strong> para realizar el pago.</p>
            <p>Una vez confirmado, tu pedido entra a proceso de envío.</p>
            <p>Guarda tu comprobante de pago para cualquier aclaración.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
