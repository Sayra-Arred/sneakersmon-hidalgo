// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
export * from './product'
export * from './order'
export * from './auth'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export interface KpiCard {
  label: string
  value: string | number
  change: number
  changeLabel: string
  trend: 'up' | 'down' | 'neutral'
}
