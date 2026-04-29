"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { fetchCurrentUser } from "@/lib/auth";
import { initializeOpenApi } from "@/lib/openapi";


export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user, setUser, logout, setLoading } = useAuthStore();

  useEffect(() => {
    initializeOpenApi();
  }, []);

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
