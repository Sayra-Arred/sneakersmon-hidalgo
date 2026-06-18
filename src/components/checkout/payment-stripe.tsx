'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Lock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

interface PaymentStripeInnerProps {
  orderId: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
}

function PaymentStripeInner({ orderId, amount, onSuccess }: PaymentStripeInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    setIsLoading(true)
    setCardError(null)

    try {
      // Create payment intent via API
      const res = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Error al iniciar el pago')
      }

      const { clientSecret } = await res.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      })

      if (error) {
        setCardError(error.message ?? 'Error al procesar el pago')
        toast.error(error.message ?? 'Error al procesar el pago')
      } else if (paymentIntent?.status === 'succeeded') {
        toast.success('¡Pago exitoso!')
        onSuccess(paymentIntent.id)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado'
      setCardError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-brand-elevated border border-brand-border rounded-xl p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                '::placeholder': { color: '#6b7280' },
                iconColor: '#ff5a20',
              },
              invalid: { color: '#ef4444', iconColor: '#ef4444' },
            },
          }}
          onChange={(e) => {
            if (e.error) setCardError(e.error.message)
            else setCardError(null)
          }}
        />
      </div>

      {cardError && (
        <p className="text-brand-error text-sm flex items-center gap-1">
          <span>⚠</span> {cardError}
        </p>
      )}

      <div className="flex items-center gap-2 text-brand-muted text-xs">
        <Lock className="w-3.5 h-3.5" />
        <span>Pago seguro cifrado con SSL. Powered by Stripe.</span>
      </div>

      <Button type="submit" isLoading={isLoading} disabled={!stripe || isLoading} className="w-full" size="lg">
        <CreditCard className="w-4 h-4" />
        {isLoading ? 'Procesando...' : 'Pagar con tarjeta'}
      </Button>
    </form>
  )
}

interface PaymentStripeProps {
  orderId: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
}

export function PaymentStripe({ orderId, amount, onSuccess }: PaymentStripeProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        locale: 'es',
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#ff5a20',
            colorBackground: '#1c1c1e',
            colorText: '#ffffff',
            borderRadius: '12px',
          },
        },
      }}
    >
      <PaymentStripeInner orderId={orderId} amount={amount} onSuccess={onSuccess} />
    </Elements>
  )
}
