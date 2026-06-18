'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, CheckCircle2, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

interface DropRegistrationFormProps {
  dropId: string
  isLive?: boolean
}

export function DropRegistrationForm({ dropId, isLive }: DropRegistrationFormProps) {
  const { data: session } = useSession()
  const [phone, setPhone] = useState('')
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  if (!session) {
    return (
      <div className="text-center py-4">
        <p className="text-brand-muted text-sm mb-4">
          Inicia sesión para registrarte en este drop.
        </p>
        <Link
          href={`/login?callbackUrl=/drops`}
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-brand-accent text-white font-semibold text-sm hover:bg-[#e04d18] transition-colors w-full"
        >
          Iniciar sesión
        </Link>
      </div>
    )
  }

  if (registered) {
    return (
      <div className="text-center py-4 space-y-2">
        <CheckCircle2 className="w-12 h-12 text-brand-success mx-auto" />
        <p className="font-semibold text-brand-success">¡Registrado!</p>
        <p className="text-brand-muted text-sm">
          Te notificaremos cuando el drop esté disponible.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/drops/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dropId, phone: phone.trim() || undefined, notifyWhatsapp }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Error al registrarse')
      }
      setRegistered(true)
      toast.success('¡Registrado exitosamente!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  if (isLive) {
    return (
      <Link
        href="/catalog"
        className="flex items-center justify-center gap-2 h-12 w-full rounded-xl bg-brand-accent text-white font-bold text-base hover:bg-[#e04d18] transition-colors"
      >
        <ShoppingBag className="w-5 h-5" />
        Ir al catálogo
      </Link>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Teléfono (opcional)"
        type="tel"
        placeholder="10 dígitos"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        maxLength={10}
      />

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={notifyWhatsapp}
          onChange={(e) => setNotifyWhatsapp(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-brand-border bg-brand-elevated checked:bg-brand-accent checked:border-brand-accent focus:ring-brand-accent"
        />
        <span className="text-sm text-brand-muted group-hover:text-white transition-colors">
          Notificarme por WhatsApp
        </span>
      </label>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={loading}
        className="w-full"
        leftIcon={<Bell className="w-4 h-4" />}
      >
        Registrarme para el drop
      </Button>

      <p className="text-xs text-brand-muted text-center">
        Recibirás notificación por email. Los cupos son limitados.
      </p>
    </form>
  )
}
