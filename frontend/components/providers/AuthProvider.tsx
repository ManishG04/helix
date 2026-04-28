"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { fetchCurrentUser } from "@/lib/auth";


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
