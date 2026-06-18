// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentMethod = 'STRIPE' | 'MERCADOPAGO' | 'SPEI'

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface OrderItemProduct {
  name: string
  slug: string
  image: string
}

export interface OrderItemVariant {
  size: string
  sku: string
}

export interface OrderItem {
  id: string
  variantId: string
  productId: string
  quantity: number
  price: number
  subtotal: number
  product: OrderItemProduct
  variant: OrderItemVariant
}

export interface OrderAddress {
  name: string
  street: string
  colonia: string
  city: string
  state: string
  postalCode: string
  phone: string
  references: string | null
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentIntentId: string | null
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  items: OrderItem[]
  address: OrderAddress
  coupon: { code: string } | null
  notes: string | null
  trackingNumber: string | null
  estimatedDelivery: Date | null
  deliveredAt: Date | null
  cancelledAt: Date | null
  cancelReason: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SpeiDetails {
  clabe: string
  reference: string
  amount: number
  bank: string
  expiresAt: Date
}

export interface OrderSummary {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  total: number
  itemCount: number
  primaryImage: string | null
  createdAt: Date
}
