// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('es-MX', options ?? { dateStyle: 'long' }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `SMH-${year}-${rand}`
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateSKU(brand: string, model: string, size: string): string {
  const b = brand.substring(0, 2).toUpperCase()
  const m = model.substring(0, 3).toUpperCase().replace(/\s/g, '')
  return `${b}-${m}-${size}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function getDiscountPercentage(price: number, compareAtPrice: number): number {
  if (compareAtPrice <= 0) return 0
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

export function isInStock(inventory: { quantity: number; reserved: number } | null): boolean {
  if (!inventory) return false
  return inventory.quantity - inventory.reserved > 0
}

export function getAvailableStock(inventory: { quantity: number; reserved: number } | null): number {
  if (!inventory) return 0
  return Math.max(0, inventory.quantity - inventory.reserved)
}

export function calculateShipping(subtotal: number): { cost: number; estimate: string } {
  if (subtotal >= 3000) return { cost: 0, estimate: '1-2 días hábiles' }
  if (subtotal >= 1500) return { cost: 99, estimate: '2-3 días hábiles' }
  return { cost: 149, estimate: '3-5 días hábiles' }
}

export function generateSpeiReference(): string {
  return Math.random().toString(36).substring(2, 14).toUpperCase()
}

export function parsePageParam(value: unknown, fallback = 1): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base}${path}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}
