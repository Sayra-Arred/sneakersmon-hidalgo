'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Shield, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SecurityPage() {
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<PasswordForm>()
  const newPassword = watch('newPassword')

  async function onSubmit(data: PasswordForm) {
    setSaving(true)
    try {
      const res = await fetch('/api/account/security/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al cambiar la contraseña')

      setDone(true)
      reset()
      toast.success('Contraseña actualizada correctamente')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl">Seguridad</h1>
        <p className="text-brand-muted text-sm mt-1">Administra la seguridad de tu cuenta</p>
      </div>

      {/* Change password */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="font-bold">Cambiar contraseña</h2>
            <p className="text-brand-muted text-sm">Usa una contraseña segura de al menos 8 caracteres</p>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-brand-success mb-3" />
            <p className="font-semibold text-brand-success">¡Contraseña actualizada!</p>
            <p className="text-brand-muted text-sm mt-1">Tu contraseña ha sido cambiada exitosamente.</p>
            <Button variant="outline" className="mt-4" size="sm" onClick={() => setDone(false)}>
              Cambiar de nuevo
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-brand-muted mb-1.5">Contraseña actual *</label>
              <div className="relative">
                <input
                  {...register('currentPassword', { required: 'Campo requerido' })}
                  type={showCurrent ? 'text' : 'password'}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-brand-error text-xs mt-1">{errors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-brand-muted mb-1.5">Nueva contraseña *</label>
              <div className="relative">
                <input
                  {...register('newPassword', {
                    required: 'Campo requerido',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Debe incluir mayúscula, minúscula y número',
                    },
                  })}
                  type={showNew ? 'text' : 'password'}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-brand-error text-xs mt-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-brand-muted mb-1.5">Confirmar nueva contraseña *</label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Campo requerido',
                    validate: (v) => v === newPassword || 'Las contraseñas no coinciden',
                  })}
                  type={showConfirm ? 'text' : 'password'}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Repite la nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-brand-error text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" isLoading={saving} className="mt-2">
              <Lock className="w-4 h-4" />
              Actualizar contraseña
            </Button>
          </form>
        )}
      </div>

      {/* Security tips */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-success/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-brand-success" />
          </div>
          <h2 className="font-bold">Consejos de seguridad</h2>
        </div>
        <ul className="space-y-2 text-sm text-brand-muted">
          {[
            'Usa una contraseña única que no uses en otros sitios.',
            'Incluye mayúsculas, minúsculas, números y símbolos.',
            'No compartas tu contraseña con nadie.',
            'Cierra sesión en dispositivos que no uses.',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
