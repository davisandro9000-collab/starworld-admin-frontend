import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../api/auth.api';

interface AdminAuthState {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isLoading: boolean;
  setAdmin: (user: AdminUser, token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      adminUser: null,
      adminToken: null,
      isLoading: false,
      setAdmin: (user, token) => set({ adminUser: user, adminToken: token, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => set({ adminUser: null, adminToken: null, isLoading: false }),
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ adminToken: state.adminToken, adminUser: state.adminUser }),
    }
  )
);