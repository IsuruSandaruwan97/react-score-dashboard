'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AdminRole = 'main' | 'normal';

export interface Admin {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'disabled';
  requirePasswordChange: boolean;
  lastLogin: string;
  createdAt: string;
}

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      login: async (username: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (data.success && data.admin) {
            set({ admin: data.admin, isAuthenticated: true });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[v0] Login error:', error);
          return false;
        }
      },
      logout: () => {
        set({ admin: null, isAuthenticated: false });
      },
      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          const admin = get().admin;
          if (!admin) return false;

          const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              adminId: admin.id,
              currentPassword,
              newPassword,
            }),
          });

          const data = await response.json();

          if (data.success && data.admin) {
            set({ admin: data.admin });
            return true;
          }

          return false;
        } catch (error) {
          console.error('[v0] Password change error:', error);
          return false;
        }
      },
    }),
    {
      name: 'admin-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
