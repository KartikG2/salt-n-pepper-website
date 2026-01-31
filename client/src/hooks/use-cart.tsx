import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '@shared/schema';

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id);

        if (existingItem) {
          const updatedItems = items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
            itemCount: calculateItemCount(updatedItems),
          });
        } else {
          const newItems = [...items, { ...item, quantity: 1 }];
          set({
            items: newItems,
            total: calculateTotal(newItems),
            itemCount: calculateItemCount(newItems),
          });
        }
      },

      removeItem: (itemId) => {
        const { items } = get();
        const updatedItems = items.filter((i) => i.id !== itemId);
        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        });
      },

      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const updatedItems = items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        );
        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        });
      },

      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
    }),
    {
      name: 'restaurant-cart',
    }
  )
);

function calculateTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

function calculateItemCount(items: CartItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0);
}
