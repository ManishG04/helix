"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  FolderKanban,
  UsersRound,
  Clock,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Card, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import {
  AppointmentsService,
  AppointmentStatus,
  ProjectsService,
  ProjectStatus,
  TeamsService,
} from "@/src/api";
import type { AppointmentWithDetails, Project } from "@/src/api";

export default function StudentDashboardClient() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamsCount, setTeamsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [appointmentsRes, projectsRes, teamsRes] = await Promise.all([
          AppointmentsService.listAppointments(1, 10),
          ProjectsService.listProjects(1, 10),
          TeamsService.listTeams(1, 50),
        ]);
        if (!isMounted) return;
        setAppointments(
          Array.isArray(appointmentsRes)
            ? (appointmentsRes as AppointmentWithDetails[])
            : (appointmentsRes.items || [])
        );
        setProjects(
          Array.isArray(projectsRes) ? (projectsRes as Project[]) : (projectsRes.items || [])
        );
        setTeamsCount(Array.isArray(teamsRes) ? teamsRes.length : (teamsRes.items?.length || 0));
      } catch {
        if (!isMounted) return;
        setAppointments([]);
        setProjects([]);
        setTeamsCount(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const pendingAppointments = useMemo(
    () => appointments.filter((apt) => apt.status === AppointmentStatus.PENDING).length,
    [appointments]
  );
  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (apt) =>
          apt.status === AppointmentStatus.PENDING ||
          apt.status === AppointmentStatus.ACCEPTED
      ),
    [appointments]
  );
  const activeProjects = useMemo(
    () =>
      projects.filter(
        (proj) => proj.status === ProjectStatus.APPROVED
      ).length,
    [projects]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome back, {user?.name ?? "Student"}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Here&apos;s a summary of your academic activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming Appointments"
          value={upcomingAppointments.length}
          icon={CalendarCheck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend={loading ? "Loading..." : undefined}
        />
        <StatCard
          label="Active Projects"
          value={activeProjects}
          icon={FolderKanban}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          label="My Teams"
          value={teamsCount}
          icon={UsersRound}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Pending Requests"
          value={pendingAppointments}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card title="Upcoming Appointments">
          {loading ? (
            <p className="text-sm text-gray-400">Loading appointments...</p>
          ) : upcomingAppointments.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming appointments.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingAppointments.slice(0, 5).map((apt) => (
                <li key={apt.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.faculty?.name || "Faculty"}</p>
                    <p className="text-xs text-gray-500">
                      {apt.date} &middot; {apt.start_time?.slice(0, 5)} - {apt.end_time?.slice(0, 5)}
                    </p>
                  </div>
                  <Badge status={apt.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* My Projects */}
        <Card title="My Projects">
          {loading ? (
            <p className="text-sm text-gray-400">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-gray-500">No projects yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {projects.slice(0, 5).map((proj) => (
                <li key={proj.id} className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{proj.title}</p>
                  <Badge status={proj.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
