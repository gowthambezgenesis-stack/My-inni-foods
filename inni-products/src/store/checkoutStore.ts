import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShippingInfo {
  email: string;
  phoneCountryCode: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export const EMPTY_SHIPPING_INFO: ShippingInfo = {
  email: '',
  phoneCountryCode: '+91',
  phone: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
};

interface CheckoutState {
  shippingInfo: ShippingInfo;
  updateShippingInfo: (updates: Partial<ShippingInfo>) => void;
  clearShippingInfo: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      shippingInfo: { ...EMPTY_SHIPPING_INFO },

      updateShippingInfo: (updates) =>
        set((state) => ({
          shippingInfo: { ...state.shippingInfo, ...updates },
        })),

      clearShippingInfo: () =>
        set({
          shippingInfo: { ...EMPTY_SHIPPING_INFO },
        }),
    }),
    {
      name: 'inni-checkout',
      partialize: (state) => ({
        shippingInfo: state.shippingInfo,
      }),
    },
  ),
);
