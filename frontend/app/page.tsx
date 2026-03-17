"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

const ROLE_REDIRECT: Record<UserRole, string> = {
  STUDENT: "/dashboard/student",
  FACULTY: "/dashboard/faculty",
  ADMIN: "/dashboard/admin",
};

export default function RootPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.replace(ROLE_REDIRECT[user.role]);
    } else if (!token) {
      router.replace("/login");
    }
    // If token exists but user not yet loaded, AuthProvider will handle it
  }, [user, token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}
