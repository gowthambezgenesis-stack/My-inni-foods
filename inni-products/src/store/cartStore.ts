import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { getCartLineKey } from '../lib/productVariants';

interface CartStore {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product, quantity = 1) => {
        const lineKey = getCartLineKey(product);
        set((state) => {
          const existing = state.cartItems.find((item) => getCartLineKey(item.product) === lineKey);
          if (existing) {
            return {
              cartItems: state.cartItems.map((item) =>
                getCartLineKey(item.product) === lineKey
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return { cartItems: [...state.cartItems, { product, quantity }] };
        });
      },

      removeFromCart: (lineKey) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => getCartLineKey(item.product) !== lineKey),
        }));
      },

      updateQuantity: (lineKey, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(lineKey);
          return;
        }
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            getCartLineKey(item.product) === lineKey ? { ...item, quantity } : item,
          ),
        }));
      },

      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'inni-cart',
      partialize: (state) => ({
        cartItems: state.cartItems,
      }),
    },
  ),
);
