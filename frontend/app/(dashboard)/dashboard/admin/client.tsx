"use client";

import React from "react";
import {
  Users,
  GraduationCap,
  FolderKanban,
  CalendarCheck,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Card, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";

const PLACEHOLDER_RECENT_USERS = [
  { name: "Arjun Mehta", email: "arjun@univ.edu", role: "STUDENT" as const, joined: "Mar 16, 2026" },
  { name: "Dr. Anita Sharma", email: "anita@univ.edu", role: "FACULTY" as const, joined: "Mar 14, 2026" },
  { name: "Priya Singh", email: "priya@univ.edu", role: "STUDENT" as const, joined: "Mar 12, 2026" },
];

const ROLE_BADGE: Record<string, "info" | "purple"> = {
  STUDENT: "info",
  FACULTY: "purple",
};

export default function AdminDashboardClient() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Admin Panel – {user?.name ?? "Administrator"}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          System-wide overview of users, projects, and activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={124}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend="+3 this week"
        />
        <StatCard
          label="Faculty Members"
          value={18}
          icon={GraduationCap}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Active Projects"
          value={37}
          icon={FolderKanban}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          trend="12 completed this month"
        />
        <StatCard
          label="Appointments (Today)"
          value={9}
          icon={CalendarCheck}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Registrations */}
        <Card title="Recent Registrations">
          <ul className="flex flex-col gap-3">
            {PLACEHOLDER_RECENT_USERS.map((u, i) => (
              <li key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">
                    {u.email} &middot; {u.joined}
                  </p>
                </div>
                <Badge variant={ROLE_BADGE[u.role] ?? "default"}>
                  {u.role}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" description="Common administrative tasks">
          <ul className="flex flex-col gap-2">
            {[
              "Review pending faculty requests",
              "Export user report (CSV)",
              "View appointment logs",
              "Manage project phases",
            ].map((action, i) => (
              <li
                key={i}
                className="cursor-pointer rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {action}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
