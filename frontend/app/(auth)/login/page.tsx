"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { login } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

const ROLE_REDIRECT: Record<UserRole, string> = {
  STUDENT: "/dashboard/student",
  FACULTY: "/dashboard/faculty",
  ADMIN: "/dashboard/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const tokenData = await login({ email, password });
      setToken(tokenData.access_token);
      setUser(tokenData.user);
      router.push(ROLE_REDIRECT[tokenData.user.role] ?? "/");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <span className="text-lg font-bold text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Helix</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              leftIcon={<Lock size={16} />}
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full mt-1">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Create one
          </Link>
        </p>

        {/* Demo credentials – remove before production */}
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-500">
          <p className="mb-1 font-semibold text-gray-600">Demo accounts (password: password123)</p>
          <p>student@helix.dev &rarr; Student dashboard</p>
          <p>faculty@helix.dev &rarr; Faculty dashboard</p>
          <p>admin@helix.dev &rarr; Admin dashboard</p>
        </div>
      </div>
    </div>
  );
}
