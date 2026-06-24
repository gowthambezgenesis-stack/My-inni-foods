import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Product, SignatureKit } from '../types';
import {
  LegacyCreateOrderResponse,
  LegacyPaymentOrderPayload,
  PaymentRecord,
  VerifyPaymentPayload,
} from '../types/payment';
import { PRODUCTS, SIGNATURE_KITS } from '../data';
import { useAuthStore } from '../store/authStore';

const DEFAULT_DEV_API_BASE_URL = 'http://localhost:8000/api';

/**
 * Resolve and validate the backend API base URL from Vite env.
 * - Development: falls back to localhost with a console warning if unset.
 * - Production: throws if VITE_API_BASE_URL is missing or invalid.
 */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();

  if (raw) {
    try {
      const parsed = new URL(raw);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('URL must use http or https');
      }
      return raw.replace(/\/+$/, '');
    } catch {
      const message =
        `Invalid VITE_API_BASE_URL: "${raw}". ` +
        'Expected a full URL such as http://localhost:8000/api';
      if (import.meta.env.PROD) {
        throw new Error(message);
      }
      console.error(`[inni] ${message}`);
    }
  }

  if (import.meta.env.DEV) {
    console.warn(
      `[inni] VITE_API_BASE_URL is not set. Using default: ${DEFAULT_DEV_API_BASE_URL}. ` +
        'Copy .env.example to .env and restart yarn dev.',
    );
    return DEFAULT_DEV_API_BASE_URL;
  }

  throw new Error(
    'VITE_API_BASE_URL is required in production. Set it in your build environment or .env file.',
  );
}

export const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/** Attach Bearer access token to every request. */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('inni_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processRefreshQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

/** On 401, attempt silent refresh via HttpOnly cookie; logout if refresh fails. */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login/') ||
      originalRequest.url?.includes('/auth/refresh/') ||
      originalRequest.url?.includes('/admin/auth/');

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post<{ access: string }>('/auth/refresh/', {});
      localStorage.setItem('inni_access_token', data.access);
      useAuthStore.getState().setAccessToken(data.access);
      processRefreshQueue(data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return api(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export interface BackendProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  original_price: string | null;
  category: number;
  category_detail?: {
    id: number;
    name: string;
    slug: string;
    description: string;
  };
  images: string[];
  stock: number;
  weight_options: string[];
  spice_level: number;
  color: string;
  badge: string;
  story: string;
  is_signature_kit: boolean;
  is_active: boolean;
}

export function mapBackendProductToProduct(bp: BackendProduct): Product {
  return {
    id: bp.slug,
    name: bp.name,
    description: bp.description,
    price: parseFloat(bp.price),
    weight: bp.weight_options && bp.weight_options.length > 0 ? bp.weight_options[0] : '250g',
    category: bp.category_detail ? bp.category_detail.slug : 'veg',
    image: bp.images && bp.images.length > 0 ? bp.images[0] : '',
    color: bp.color || 'from-orange-500 to-red-600',
    isSignatureKit: bp.is_signature_kit,
  };
}

export function mapBackendProductToSignatureKit(bp: BackendProduct): SignatureKit {
  const base = mapBackendProductToProduct(bp);
  return {
    ...base,
    badge: bp.badge || 'Signature Collection',
    story: bp.story || bp.description,
    originalPrice: bp.original_price ? parseFloat(bp.original_price) : undefined,
  };
}

export async function fetchAllProducts(): Promise<{ products: Product[]; signatureKits: SignatureKit[] }> {
  return { products: PRODUCTS, signatureKits: SIGNATURE_KITS };
}

export async function fetchProductBySlug(slug: string): Promise<Product | SignatureKit | null> {
  const product = PRODUCTS.find(p => p.id === slug) || SIGNATURE_KITS.find(p => p.id === slug);
  return product || null;
}

/** @deprecated Use createOrder from features/orders/orderApi.ts */
export async function createPaymentOrder(payload: LegacyPaymentOrderPayload): Promise<LegacyCreateOrderResponse> {
  const { data } = await api.post<LegacyCreateOrderResponse>('/payment/create-order/', payload);
  return data;
}

/** Verify Razorpay payment signature after checkout success. */
export async function verifyPayment(payload: VerifyPaymentPayload): Promise<PaymentRecord> {
  const { data } = await api.post<PaymentRecord>('/payment/verify-payment/', payload);
  return data;
}
