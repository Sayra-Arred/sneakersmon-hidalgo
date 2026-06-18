'use client'
import { create } from 'zustand'

interface UIStore {
  isSearchOpen: boolean
  isMobileNavOpen: boolean
  quickViewProductId: string | null
  openSearch: () => void
  closeSearch: () => void
  openMobileNav: () => void
  closeMobileNav: () => void
  setQuickViewProduct: (id: string | null) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  isSearchOpen: false,
  isMobileNavOpen: false,
  quickViewProductId: null,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  setQuickViewProduct: (id) => set({ quickViewProductId: id }),
}))
