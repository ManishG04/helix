"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/authStore";
import { NAV_ITEMS } from "@/lib/navItems";
import type { UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Administrator",
};

function RoleBadgeColor(role: UserRole) {
  return {
    STUDENT: "bg-blue-100 text-blue-700",
    FACULTY: "bg-purple-100 text-purple-700",
    ADMIN: "bg-orange-100 text-orange-700",
  }[role];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guard against partial rehydration from Zustand persist:
  // user may be set but still missing fields if the stored shape is stale.
  if (!user || !user.name) {
    return null;
  }

  const navItems = NAV_ITEMS[user.role] ?? [];

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-sm font-bold text-white">H</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">Helix</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {(user.name?.[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {user.name}
            </p>
            <span
              className={clsx(
                "inline-block rounded-full px-1.5 py-0.5 text-xs font-medium",
                RoleBadgeColor(user.role)
              )}
            >
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">{Sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 flex">{Sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <button
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Page title derived from current route */}
          <span className="text-sm font-semibold text-gray-700 lg:ml-0 ml-2">
            {navItems.find((n) => n.href === pathname)?.label ?? "Dashboard"}
          </span>

          {/* Right side – user chip */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {(user.name?.[0] ?? "?").toUpperCase()}
              </div>
              <span className="font-medium">{user.name}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
