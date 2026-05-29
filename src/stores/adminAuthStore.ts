// src/stores/adminAuthStore.ts
import { create } from 'zustand';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AdminAuthState {
  adminUser: AdminUser | null;
  adminToken: string | null;
  isLoading: boolean;
  setAdmin: (user: AdminUser, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  adminUser: null,
  adminToken: null,
  isLoading: false,
  setAdmin: (user, token) => set({ adminUser: user, adminToken: token, isLoading: false }),
  logout: () => set({ adminUser: null, adminToken: null, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));