"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { clearToken, saveToken } from "@/lib/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      setToken: (token) => {
        saveToken(token);
        set({ token });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        clearToken();
        set({ user: null, token: null });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "helix-auth-v2",        // bumped from v1 to purge stale localStorage
      // Only persist the token; user is re-fetched by AuthProvider on mount
      partialize: (state) => ({ token: state.token }),
    }
  )
);
