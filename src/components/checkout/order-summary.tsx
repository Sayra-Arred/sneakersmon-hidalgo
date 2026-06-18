'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Tag, X, Loader2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { calculateShipping } from '@/lib/utils'
import toast from 'react-hot-toast'

interface OrderSummaryProps {
  onPlaceOrder: () => void
  isLoading: boolean
}

export function OrderSummary({ onPlaceOrder, isLoading }: OrderSummaryProps) {
  const { items, coupon, applyCoupon, removeCoupon, getSubtotal, getDiscount } = useCartStore()
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const { cost: shipping, estimate } = calculateShipping(subtotal - discount)
  const total = Math.max(0, subtotal - discount + shipping)

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        applyCoupon({ code: data.code, discount: data.discount, type: data.type })
        setCouponInput('')
        toast.success(data.message)
      } else {
        toast.error(data.message ?? 'Cupón no válido')
      }
    } catch {
      toast.error('Error al validar el cupón')
    } finally {
      setCouponLoading(false)
    }
  }

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-brand-border">
        <h2 className="font-display font-bold text-lg">Resumen del pedido</h2>
        <p className="text-brand-muted text-sm mt-0.5">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
      </div>

      {/* Items */}
      <div className="px-6 py-4 space-y-4 max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-10 h-10 text-brand-muted mx-auto mb-2" />
            <p className="text-brand-muted text-sm">Tu carrito está vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.variantId} className="flex gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-brand-elevated flex-shrink-0 border border-brand-border">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-brand-muted" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight truncate">{item.name}</p>
                <p className="text-brand-muted text-xs mt-0.5">{item.brand}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-brand-elevated px-2 py-0.5 rounded-md">Talla {item.size}</span>
                  <span className="text-xs text-brand-muted">× {item.quantity}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                {item.quantity > 1 && (
                  <p className="text-brand-muted text-xs">{formatPrice(item.price)} c/u</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Coupon */}
      <div className="px-6 py-4 border-t border-brand-border">
        {coupon ? (
          <div className="flex items-center justify-between bg-brand-success/10 border border-brand-success/20 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-success" />
              <span className="text-brand-success text-sm font-semibold">{coupon.code}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-success text-sm">−{formatPrice(discount)}</span>
              <button
                onClick={removeCoupon}
                className="text-brand-muted hover:text-brand-error transition-colors"
                aria-label="Quitar cupón"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              placeholder="Código de cupón"
              className="flex-1 bg-brand-elevated border border-brand-border rounded-xl px-3 py-2 text-sm placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
            />
            <Button
              onClick={handleApplyCoupon}
              isLoading={couponLoading}
              disabled={!couponInput.trim() || couponLoading}
              variant="secondary"
              size="sm"
              className="whitespace-nowrap"
            >
              Aplicar
            </Button>
          </div>
        )}
      </div>

      {/* Cost breakdown */}
      <div className="px-6 py-4 border-t border-brand-border space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-brand-muted">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-brand-success">Descuento</span>
            <span className="text-brand-success">−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-brand-muted">
            Envío
            {shipping === 0 && <span className="ml-1 text-brand-success text-xs">(gratis)</span>}
          </span>
          <span className={shipping === 0 ? 'text-brand-success' : ''}>
            {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-brand-muted text-xs">Estimado: {estimate}</p>
        )}
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-brand-border">
          <span>Total</span>
          <span className="text-brand-accent">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Place order button */}
      <div className="px-6 pb-6">
        <Button
          onClick={onPlaceOrder}
          isLoading={isLoading}
          disabled={items.length === 0 || isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? 'Procesando...' : 'Realizar pedido'}
        </Button>
        <p className="text-center text-brand-muted text-xs mt-3">
          Al realizar el pedido aceptas nuestros{' '}
          <a href="/terms" className="text-brand-accent hover:underline">Términos</a>
          {' '}y{' '}
          <a href="/privacy" className="text-brand-accent hover:underline">Política de privacidad</a>
        </p>
      </div>
    </div>
  )
}
