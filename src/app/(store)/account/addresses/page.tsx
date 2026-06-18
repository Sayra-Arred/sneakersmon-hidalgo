'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Plus, Trash2, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface Address {
  id: string
  name: string
  street: string
  colonia: string
  city: string
  state: string
  country: string
  postalCode: string
  phone: string
  references?: string | null
  isDefault: boolean
}

interface AddressForm {
  name: string
  street: string
  colonia: string
  city: string
  state: string
  postalCode: string
  phone: string
  references?: string
  isDefault: boolean
}

const MX_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>({
    defaultValues: { isDefault: false },
  })

  async function loadAddresses() {
    try {
      const res = await fetch('/api/account/addresses')
      const data = await res.json()
      if (data.success) setAddresses(data.data)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadAddresses() }, [])

  async function onSubmit(data: AddressForm) {
    setSaving(true)
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al guardar')
      toast.success('Dirección guardada')
      reset()
      setShowForm(false)
      loadAddresses()
    } catch {
      toast.error('Error al guardar la dirección')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta dirección?')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Dirección eliminada')
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await fetch('/api/account/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      })
      toast.success('Dirección predeterminada actualizada')
      loadAddresses()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl">Mis direcciones</h1>
          <p className="text-brand-muted text-sm mt-1">Gestiona tus direcciones de entrega</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="w-4 h-4" />
            Nueva dirección
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">Nueva dirección</h2>
            <button onClick={() => { setShowForm(false); reset() }} className="text-brand-muted hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-brand-muted mb-1.5">Nombre completo *</label>
                <input
                  {...register('name', { required: 'Requerido' })}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Quien recibe"
                />
                {errors.name && <p className="text-brand-error text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-brand-muted mb-1.5">Teléfono *</label>
                <input
                  {...register('phone', { required: 'Requerido', minLength: { value: 10, message: 'Mín 10 dígitos' } })}
                  type="tel"
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="10 dígitos"
                />
                {errors.phone && <p className="text-brand-error text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-brand-muted mb-1.5">Calle y número *</label>
              <input
                {...register('street', { required: 'Requerido' })}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                placeholder="Av. Juárez 123, Int. 4B"
              />
              {errors.street && <p className="text-brand-error text-xs mt-1">{errors.street.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-brand-muted mb-1.5">Colonia *</label>
                <input
                  {...register('colonia', { required: 'Requerido' })}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Col. Centro"
                />
                {errors.colonia && <p className="text-brand-error text-xs mt-1">{errors.colonia.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-brand-muted mb-1.5">Código Postal *</label>
                <input
                  {...register('postalCode', { required: 'Requerido' })}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="42000"
                  maxLength={6}
                />
                {errors.postalCode && <p className="text-brand-error text-xs mt-1">{errors.postalCode.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-brand-muted mb-1.5">Ciudad *</label>
                <input
                  {...register('city', { required: 'Requerido' })}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Pachuca de Soto"
                />
                {errors.city && <p className="text-brand-error text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-brand-muted mb-1.5">Estado *</label>
                <select
                  {...register('state', { required: 'Requerido' })}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors text-white"
                >
                  <option value="">Selecciona un estado</option>
                  {MX_STATES.map((s) => (
                    <option key={s} value={s} className="bg-brand-elevated">{s}</option>
                  ))}
                </select>
                {errors.state && <p className="text-brand-error text-xs mt-1">{errors.state.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-brand-muted mb-1.5">Referencias (opcional)</label>
              <input
                {...register('references')}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                placeholder="Entre calles, color de fachada, etc."
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="h-4 w-4 rounded border-brand-border bg-brand-elevated checked:bg-brand-accent"
              />
              <span className="text-sm text-brand-muted">Establecer como dirección predeterminada</span>
            </label>

            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={saving}>
                Guardar dirección
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset() }}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-brand-surface border border-brand-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center">
          <MapPin className="w-12 h-12 text-brand-muted mx-auto mb-4" />
          <p className="font-semibold">Sin direcciones guardadas</p>
          <p className="text-brand-muted text-sm mt-2">Agrega tu primera dirección de entrega.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-brand-surface border rounded-2xl p-5 ${address.isDefault ? 'border-brand-accent' : 'border-brand-border'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{address.name}</p>
                    {address.isDefault && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent uppercase tracking-wide">
                        <Star className="w-3 h-3" />
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-brand-muted text-sm">{address.street}</p>
                  <p className="text-brand-muted text-sm">
                    {address.colonia}, {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-brand-muted text-sm">{address.phone}</p>
                  {address.references && (
                    <p className="text-brand-muted text-xs mt-1 italic">{address.references}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="p-1.5 rounded-lg text-brand-muted hover:text-brand-accent hover:bg-brand-accent/10 transition-colors"
                      title="Hacer predeterminada"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="p-1.5 rounded-lg text-brand-muted hover:text-brand-error hover:bg-brand-error/10 transition-colors disabled:opacity-40"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
