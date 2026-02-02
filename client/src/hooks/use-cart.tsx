import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, ItemPrices } from "@shared/schema";

export interface CartItem extends MenuItem {
  quantity: number;
  portion: keyof ItemPrices;
  selectedPrice: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem, portion: keyof ItemPrices) => void;
  removeItem: (itemId: number, portion: keyof ItemPrices) => void;
  updateQuantity: (
    itemId: number,
    quantity: number,
    portion: keyof ItemPrices,
  ) => void;
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

      addItem: (item, portion) => {
        const { items } = get();
        const prices = item.prices as ItemPrices;
        const selectedPrice = prices[portion] || 0;

        // Check for existing item with the SAME ID and SAME PORTION
        const existingItem = items.find(
          (i) => i.id === item.id && i.portion === portion,
        );

        if (existingItem) {
          const updatedItems = items.map((i) =>
            i.id === item.id && i.portion === portion
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          );
          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
            itemCount: calculateItemCount(updatedItems),
          });
        } else {
          const newItems = [
            ...items,
            { ...item, portion, selectedPrice, quantity: 1 },
          ];
          set({
            items: newItems,
            total: calculateTotal(newItems),
            itemCount: calculateItemCount(newItems),
          });
        }
      },

      removeItem: (itemId, portion) => {
        const { items } = get();
        const updatedItems = items.filter(
          (i) => !(i.id === itemId && i.portion === portion),
        );
        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        });
      },

      updateQuantity: (itemId, quantity, portion) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(itemId, portion);
          return;
        }

        const updatedItems = items.map((i) =>
          i.id === itemId && i.portion === portion ? { ...i, quantity } : i,
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
      name: "restaurant-cart",
    },
  ),
);

function calculateTotal(items: CartItem[]) {
  // Use selectedPrice (the price for that specific portion) instead of a generic price
  return items.reduce(
    (total, item) => total + item.selectedPrice * item.quantity,
    0,
  );
}

function calculateItemCount(items: CartItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0);
}
