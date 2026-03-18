import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types/database'

export interface CartItem {
  id: string
  product: Product
  variantId?: string
  variantName?: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean

  addItem: (product: Product, variantId?: string, variantName?: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variantId, variantName) => {
        const itemId = variantId ? `${product.id}-${variantId}` : product.id
        set((s) => {
          const existing = s.items.find((i) => i.id === itemId)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return {
            items: [...s.items, { id: itemId, product, variantId, variantName, quantity: 1 }],
          }
        })
      },

      removeItem: (itemId) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== itemId) })),

      updateQuantity: (itemId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.id !== itemId)
              : s.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => {
          const price = i.product.sale_price ?? i.product.price
          return sum + price * i.quantity
        }, 0),
    }),
    { name: 'mezan-cart' }
  )
)
