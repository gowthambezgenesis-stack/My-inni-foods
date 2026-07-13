import React from 'react';
import { useCartStore } from '../store/cartStore';

/** Kept for App layout compatibility — cart state lives in Zustand + localStorage. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useCart() {
  return useCartStore();
}
