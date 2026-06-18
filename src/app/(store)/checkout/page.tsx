'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { User, MapPin, Truck, CreditCard, Plus, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { OrderSummary } from '@/components/checkout/order-summary'
import { PaymentStripe } from '@/components/checkout/payment-stripe'
import { PaymentMercadoPago } from '@/components/checkout/payment-mercadopago'
import { PaymentSpei } from '@/components/checkout/payment-spei'
import { PaymentOxxo } from '@/components/checkout/payment-oxxo'
import { PaymentBankTransfer } from '@/components/checkout/payment-bank-transfer'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { formatPrice, calculateShipping, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Address {
  id: string
  name: string
  street: string
  colonia: string
  city: string
  state: string
  postalCode: string
  phone: string
  references: string | null
  isDefault: boolean
}

interface ContactForm {
  name: string
  email: string
  phone: string
}

type PaymentMethod = 'STRIPE' | 'MERCADOPAGO' | 'SPEI' | 'OXXO' | 'TRANSFERENCIA'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, clearCart, getSubtotal, getDiscount, coupon } = useCartStore()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('STRIPE')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const { register, formState: { errors } } = useForm<ContactForm>({
    defaultValues: {
      name: session?.user?.name ?? '',
      email: session?.user?.email ?? '',
      phone: '',
    },
  })

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const { cost: shipping } = calculateShipping(subtotal - discount)
  const total = Math.max(0, subtotal - discount + shipping)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout')
    }
  }, [status, router])

  // Redirect if cart is empty
  useEffect(() => {
    if (status === 'authenticated' && items.length === 0 && !orderPlaced) {
      router.push('/catalog')
    }
  }, [items.length, status, router, orderPlaced])

  // Load addresses
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/account/addresses')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAddresses(data.data)
          const def = data.data.find((a: Address) => a.isDefault) ?? data.data[0]
          if (def) setSelectedAddressId(def.id)
        }
      })
      .catch(() => {})
  }, [status])

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast.error('Selecciona una dirección de envío')
      return
    }
    if (items.length === 0) {
      toast.error('Tu carrito está vacío')
      return
    }

    setIsPlacingOrder(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          couponCode: coupon?.code,
          items,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Error al crear el pedido')
      }

      setOrderId(data.data.orderId)
      setOrderPlaced(true)

      // For MP, the payment component handles the redirect
      if (paymentMethod === 'STRIPE' || paymentMethod === 'SPEI') {
        // Payment components handle next steps
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      toast.error(message)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  function handlePaymentSuccess() {
    clearCart()
    router.push(`/orders/${orderId}?success=true`)
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)
  const shippingEstimate = calculateShipping(subtotal - discount).estimate

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl">Checkout</h1>
          <p className="text-brand-muted mt-1">Completa tu información para finalizar la compra</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: 60% */}
          <div className="lg:col-span-3 space-y-6">

            {/* Contact info */}
            <section className="bg-brand-surface border border-brand-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-accent" />
                </div>
                <h2 className="font-bold text-lg">Información de contacto</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-brand-muted mb-1.5">Nombre completo</label>
                  <input
                    {...register('name', { required: true })}
                    defaultValue={session?.user?.name ?? ''}
                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="Tu nombre"
                  />
                  {errors.name && <p className="text-brand-error text-xs mt-1">Campo requerido</p>}
                </div>
                <div>
                  <label className="block text-sm text-brand-muted mb-1.5">Email</label>
                  <input
                    {...register('email', { required: true })}
                    defaultValue={session?.user?.email ?? ''}
                    type="email"
                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="tu@email.com"
                  />
                  {errors.email && <p className="text-brand-error text-xs mt-1">Campo requerido</p>}
                </div>
                <div>
                  <label className="block text-sm text-brand-muted mb-1.5">Teléfono</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="55 1234 5678"
                  />
                </div>
              </div>
            </section>

            {/* Address section */}
            <section className="bg-brand-surface border border-brand-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-brand-accent" />
                  </div>
                  <h2 className="font-bold text-lg">Dirección de envío</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  <Plus className="w-4 h-4" />
                  Nueva
                </Button>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                        selectedAddressId === address.id
                          ? 'border-brand-accent bg-brand-accent/5'
                          : 'border-brand-border hover:border-brand-accent/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-0.5 accent-brand-accent"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm">{address.name}</p>
                          {address.isDefault && (
                            <span className="text-[10px] bg-brand-accent text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-brand-muted text-sm">
                          {address.street}, {address.colonia}
                        </p>
                        <p className="text-brand-muted text-sm">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-brand-muted text-sm">{address.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-10 h-10 text-brand-muted mx-auto mb-2" />
                  <p className="text-brand-muted text-sm">No tienes direcciones guardadas</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setShowAddressForm(true)}
                  >
                    Agregar dirección
                  </Button>
                </div>
              )}

              {showAddressForm && (
                <div className="mt-4 pt-4 border-t border-brand-border">
                  <p className="text-sm text-brand-muted mb-3">
                    Para agregar una nueva dirección, ve a{' '}
                    <a href="/account/addresses" className="text-brand-accent hover:underline">
                      Mi cuenta → Direcciones
                    </a>
                  </p>
                </div>
              )}
            </section>

            {/* Shipping info */}
            {selectedAddress && (
              <section className="bg-brand-surface border border-brand-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-brand-accent" />
                  </div>
                  <h2 className="font-bold text-lg">Información de envío</h2>
                </div>
                <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">Envío estándar</p>
                      <p className="text-brand-muted text-sm mt-0.5">Estimado: {shippingEstimate}</p>
                      <p className="text-brand-muted text-sm">
                        A: {selectedAddress.city}, {selectedAddress.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn('font-bold text-lg', shipping === 0 ? 'text-brand-success' : '')}>
                        {shipping === 0 ? 'GRATIS' : formatPrice(shipping)}
                      </p>
                      {subtotal < 3000 && (
                        <p className="text-brand-muted text-xs mt-0.5">
                          Envío gratis a partir de {formatPrice(3000)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Payment */}
            <section className="bg-brand-surface border border-brand-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-brand-accent" />
                </div>
                <h2 className="font-bold text-lg">Método de pago</h2>
              </div>

              {!orderId ? (
                <>
                  <RadixTabs.Root
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  >
                    <RadixTabs.List className="grid grid-cols-3 sm:grid-cols-5 gap-1 bg-brand-elevated border border-brand-border rounded-xl p-1 mb-6">
                      {[
                        { value: 'STRIPE',        label: '💳 Tarjeta'       },
                        { value: 'MERCADOPAGO',   label: '🛒 Mercado Pago'  },
                        { value: 'SPEI',          label: '🏦 SPEI'          },
                        { value: 'OXXO',          label: '🏪 OXXO'          },
                        { value: 'TRANSFERENCIA', label: '🔄 Transferencia' },
                      ].map((tab) => (
                        <RadixTabs.Trigger
                          key={tab.value}
                          value={tab.value}
                          className={cn(
                            'py-2 px-2 rounded-lg text-xs font-semibold transition-all text-center',
                            'data-[state=active]:bg-brand-accent data-[state=active]:text-white',
                            'data-[state=inactive]:text-brand-muted data-[state=inactive]:hover:text-white'
                          )}
                        >
                          {tab.label}
                        </RadixTabs.Trigger>
                      ))}
                    </RadixTabs.List>

                    <RadixTabs.Content value="STRIPE">
                      <p className="text-brand-muted text-sm mb-2">Pago seguro con tarjeta de crédito o débito.</p>
                      <div className="flex items-center gap-2 text-brand-muted text-xs mb-4">
                        <ChevronRight className="w-3 h-3" />
                        Haz clic en "Realizar pedido" para iniciar el pago con tarjeta
                      </div>
                    </RadixTabs.Content>
                    <RadixTabs.Content value="MERCADOPAGO">
                      <p className="text-brand-muted text-sm mb-4">Serás redirigido a MercadoPago. Acepta tarjetas, OXXO y más.</p>
                    </RadixTabs.Content>
                    <RadixTabs.Content value="SPEI">
                      <p className="text-brand-muted text-sm mb-4">Transferencia interbancaria SPEI. Datos se generan al crear el pedido.</p>
                    </RadixTabs.Content>
                    <RadixTabs.Content value="OXXO">
                      <p className="text-brand-muted text-sm mb-4">Paga en efectivo en cualquier tienda OXXO del país.</p>
                    </RadixTabs.Content>
                    <RadixTabs.Content value="TRANSFERENCIA">
                      <p className="text-brand-muted text-sm mb-4">Depósito o transferencia directa a nuestra cuenta bancaria.</p>
                    </RadixTabs.Content>
                  </RadixTabs.Root>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-brand-muted text-sm">
                    Pedido creado. Completa el pago a continuación.
                  </p>
                  {paymentMethod === 'STRIPE' && (
                    <PaymentStripe orderId={orderId} amount={total} onSuccess={handlePaymentSuccess} />
                  )}
                  {paymentMethod === 'MERCADOPAGO' && (
                    <PaymentMercadoPago orderId={orderId} amount={total} />
                  )}
                  {paymentMethod === 'SPEI' && (
                    <PaymentSpei orderId={orderId} onPaid={handlePaymentSuccess} />
                  )}
                  {paymentMethod === 'OXXO' && (
                    <PaymentOxxo orderId={orderId} amount={total} />
                  )}
                  {paymentMethod === 'TRANSFERENCIA' && (
                    <PaymentBankTransfer orderId={orderId} amount={total} onPaid={handlePaymentSuccess} />
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right: 40% */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <OrderSummary onPlaceOrder={handlePlaceOrder} isLoading={isPlacingOrder} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
