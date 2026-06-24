import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  role: User['role'] | null;
  hasHydrated: boolean;
  login: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
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

      logout: async () => {
        try {
          await api.post('/auth/logout/');
        } catch {
          // Ignore — clear local state even if server call fails
        }
        localStorage.removeItem('inni_access_token');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isSuperAdmin: false,
          role: null,
        });
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
