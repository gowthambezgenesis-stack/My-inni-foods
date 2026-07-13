import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { api } from '../lib/api';
import { useAdminNotificationStore } from './adminNotificationStore';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  role: User['role'] | null;
  hasHydrated: boolean;
  login: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
  initialize: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      role: null,
      hasHydrated: false,

      login: (user, accessToken) => {
        localStorage.setItem('inni_access_token', accessToken);
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isSuperAdmin: Boolean(user.is_super_admin),
          role: user.role,
        });
      },

      setAccessToken: (accessToken) => {
        localStorage.setItem('inni_access_token', accessToken);
        set({ accessToken });
      },

      clearSession: () => {
        localStorage.removeItem('inni_access_token');
        useAdminNotificationStore.getState().clear();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isSuperAdmin: false,
          role: null,
        });
      },

      logout: async () => {
        // Clear local auth first so concurrent 401 handlers cannot re-enter.
        get().clearSession();
        try {
          await api.post('/auth/logout/');
        } catch {
          // Ignore — local session is already cleared
        }
      },

      initialize: () => {
        const accessToken = localStorage.getItem('inni_access_token');
        const { user } = get();
        if (accessToken && user) {
          set({
            accessToken,
            isAuthenticated: true,
            isSuperAdmin: Boolean(user.is_super_admin),
            role: user.role,
          });
        }
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'inni-auth',
      partialize: (state) => ({
        user: state.user,
        isSuperAdmin: state.isSuperAdmin,
        role: state.role,
      }),
    },
  ),
);

function finishAuthHydration() {
  const store = useAuthStore.getState();
  store.initialize();
  store.setHasHydrated(true);
}

useAuthStore.persist.onFinishHydration(finishAuthHydration);

if (useAuthStore.persist.hasHydrated()) {
  finishAuthHydration();
}
