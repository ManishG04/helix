"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  FolderKanban,
  CalendarCheck,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Card, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { AppointmentsService, ProjectsService, UserRole, UsersService } from "@/src/api";
import type { User } from "@/src/api";

const ROLE_BADGE: Record<string, "info" | "purple"> = {
  STUDENT: "info",
  FACULTY: "purple",
};

export default function AdminDashboardClient() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalUsers: number;
    facultyCount: number;
    totalProjects: number;
    totalAppointments: number;
  }>({
    totalUsers: 0,
    facultyCount: 0,
    totalProjects: 0,
    totalAppointments: 0,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [systemStats, usersRes, projectsRes, appointmentsRes] = await Promise.all([
          UsersService.getSystemStats(),
          UsersService.adminListUsers(1, 5),
          ProjectsService.listProjects(1, 1),
          AppointmentsService.listAppointments(1, 1),
        ]);
        if (!isMounted) return;
        setStats({
          totalUsers: systemStats.total_users || 0,
          facultyCount: systemStats.users_by_role?.FACULTY || 0,
          totalProjects: systemStats.total_projects ?? projectsRes.total ?? 0,
          totalAppointments: systemStats.total_appointments ?? appointmentsRes.total ?? 0,
        });
        setRecentUsers(usersRes.items || []);
      } catch {
        if (!isMounted) return;
        setStats({
          totalUsers: 0,
          facultyCount: 0,
          totalProjects: 0,
          totalAppointments: 0,
        });
        setRecentUsers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

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
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend={loading ? "Loading..." : undefined}
        />
        <StatCard
          label="Faculty Members"
          value={stats.facultyCount}
          icon={GraduationCap}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Active Projects"
          value={stats.totalProjects}
          icon={FolderKanban}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          label="Appointments (Today)"
          value={stats.totalAppointments}
          icon={CalendarCheck}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Registrations */}
        <Card title="Recent Registrations">
          {loading ? (
            <p className="text-sm text-gray-400">Loading users...</p>
          ) : recentUsers.length === 0 ? (
            <p className="text-sm text-gray-500">No registrations found.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">
                      {u.email} &middot; {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                  <Badge variant={ROLE_BADGE[u.role || UserRole.STUDENT] ?? "default"}>
                    {u.role}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
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
