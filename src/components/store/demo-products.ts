// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.

export interface DemoProduct {
  id: string
  name: string
  brand: string
  price: number
  emoji: string
  color: string
  sizes: string[]
  category: string
  isNew?: boolean
  isBestSeller?: boolean
}

export const demoProducts: DemoProduct[] = [
  {
    id: 'dp-001',
    name: 'Air Max 90',
    brand: 'Nike',
    price: 2799,
    emoji: '👟',
    color: 'Blanco/Negro',
    sizes: ['24', '24.5', '25', '25.5', '26', '26.5', '27', '27.5', '28'],
    category: 'lifestyle',
    isBestSeller: true,
  },
  {
    id: 'dp-002',
    name: 'Air Force 1',
    brand: 'Nike',
    price: 2299,
    emoji: '🐻',
    color: 'Blanco',
    sizes: ['24', '25', '25.5', '26', '26.5', '27', '27.5', '28', '28.5', '29'],
    category: 'lifestyle',
    isBestSeller: true,
  },
  {
    id: 'dp-003',
    name: 'Jordan 1 Retro High OG',
    brand: 'Jordan',
    price: 4999,
    emoji: '👟',
    color: 'Chicago Rojo/Negro',
    sizes: ['24.5', '25', '25.5', '26', '26.5', '27', '28'],
    category: 'basketball',
    isNew: true,
  },
  {
    id: 'dp-004',
    name: 'Jordan 4 Retro "Black Cat"',
    brand: 'Jordan',
    price: 5499,
    emoji: '🐻',
    color: 'Negro/Negro',
    sizes: ['25', '25.5', '26', '26.5', '27', '27.5'],
    category: 'basketball',
    isNew: true,
  },
  {
    id: 'dp-005',
    name: 'Yeezy 350 V2',
    brand: 'Adidas',
    price: 4299,
    emoji: '👟',
    color: 'Zebra',
    sizes: ['24', '24.5', '25', '25.5', '26', '26.5', '27', '27.5', '28', '28.5'],
    category: 'lifestyle',
    isBestSeller: true,
  },
  {
    id: 'dp-006',
    name: 'Ultraboost 22',
    brand: 'Adidas',
    price: 3199,
    emoji: '🐻',
    color: 'Core Black',
    sizes: ['24', '25', '26', '27', '27.5', '28', '28.5', '29'],
    category: 'running',
    isNew: true,
  },
  {
    id: 'dp-007',
    name: '990v6',
    brand: 'New Balance',
    price: 3799,
    emoji: '👟',
    color: 'Grey/Silver',
    sizes: ['24.5', '25', '25.5', '26', '26.5', '27', '27.5', '28'],
    category: 'lifestyle',
    isNew: true,
  },
  {
    id: 'dp-008',
    name: '574',
    brand: 'New Balance',
    price: 1799,
    emoji: '🐻',
    color: 'Navy/Rojo',
    sizes: ['24', '24.5', '25', '25.5', '26', '26.5', '27', '27.5', '28', '28.5', '29'],
    category: 'lifestyle',
  },
  {
    id: 'dp-009',
    name: 'Chuck 70',
    brand: 'Converse',
    price: 1499,
    emoji: '👟',
    color: 'Black/White',
    sizes: ['24', '25', '26', '27', '28', '29'],
    category: 'lifestyle',
  },
  {
    id: 'dp-010',
    name: 'Run Star Hike',
    brand: 'Converse',
    price: 1799,
    emoji: '🐻',
    color: 'Blanco/Negro',
    sizes: ['24', '24.5', '25', '25.5', '26', '27', '27.5', '28'],
    category: 'lifestyle',
    isNew: true,
  },
  {
    id: 'dp-011',
    name: 'Speedcat OG',
    brand: 'Puma',
    price: 1299,
    emoji: '👟',
    color: 'Rojo Ferrari',
    sizes: ['24', '24.5', '25', '25.5', '26', '26.5', '27', '28'],
    category: 'lifestyle',
    isBestSeller: true,
  },
  {
    id: 'dp-012',
    name: 'Classic Leather',
    brand: 'Reebok',
    price: 1399,
    emoji: '🐻',
    color: 'Blanco/Gum',
    sizes: ['24', '25', '26', '26.5', '27', '27.5', '28', '28.5', '29'],
    category: 'lifestyle',
  },
]
