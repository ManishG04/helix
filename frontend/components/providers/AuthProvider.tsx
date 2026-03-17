"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { fetchCurrentUser } from "@/lib/auth";

/**
 * Mount this once in the root layout.
 * On every page load it checks for a stored token and, if found,
 * re-fetches the current user profile to populate the store.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user, setUser, logout, setLoading } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      fetchCurrentUser()
        .then(setUser)
        .catch(() => logout())
        .finally(() => setLoading(false));
    }
  }, [token, user, setUser, logout, setLoading]);

  return <>{children}</>;
}
