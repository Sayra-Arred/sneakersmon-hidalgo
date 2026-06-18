// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 },
})

export interface MPItem {
  id: string
  title: string
  unit_price: number
  quantity: number
  picture_url?: string
}

export interface MPPayer {
  name: string
  email: string
  phone?: { area_code: string; number: string }
}

export async function createPreference(params: {
  items: MPItem[]
  payer: MPPayer
  orderId: string
  successUrl: string
  failureUrl: string
  pendingUrl: string
  notificationUrl: string
}) {
  const preference = new Preference(client)
  const response = await preference.create({
    body: {
      items: params.items,
      payer: params.payer,
      back_urls: {
        success: params.successUrl,
        failure: params.failureUrl,
        pending: params.pendingUrl,
      },
      auto_return: 'approved',
      notification_url: params.notificationUrl,
      external_reference: params.orderId,
      statement_descriptor: 'SNEAKERSMON',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  })
  return response
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(client)
  return payment.get({ id: paymentId })
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body)
  const digest = hmac.digest('hex')
  return digest === signature
}
