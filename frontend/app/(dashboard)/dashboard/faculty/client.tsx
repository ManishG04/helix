"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  BookOpen,
  ClipboardList,
  Users,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Card, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { AppointmentsService, AppointmentStatus, ProjectsService, TeamsService } from "@/src/api";
import type { AppointmentWithDetails, Project, Team } from "@/src/api";

export default function FacultyDashboardClient() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [appointmentsRes, projectsRes, teamsRes] = await Promise.all([
          AppointmentsService.listAppointments(1, 20),
          ProjectsService.listProjects(1, 20),
          TeamsService.listTeams(1, 100),
        ]);
        if (!isMounted) return;
        setAppointments(appointmentsRes.items || []);
        setProjects(projectsRes.items || []);
        setTeams(teamsRes.items || []);
      } catch {
        if (!isMounted) return;
        setAppointments([]);
        setProjects([]);
        setTeams([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const pendingRequests = useMemo(
    () => appointments.filter((apt) => apt.status === AppointmentStatus.PENDING),
    [appointments]
  );
  const totalStudents = useMemo(() => {
    const uniqueStudentIds = new Set(
      appointments.map((apt) => apt.student_id).filter(Boolean)
    );
    return uniqueStudentIds.size;
  }, [appointments]);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome, {user?.name ?? "Faculty"}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage your schedule, student requests, and mentored projects.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Appointments"
          value={appointments.length}
          icon={CalendarClock}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend={loading ? "Loading..." : undefined}
        />
        <StatCard
          label="Mentored Projects"
          value={projects.length}
          icon={BookOpen}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests.length}
          icon={ClipboardList}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
        />
        <StatCard
          label="Total Students"
          value={totalStudents}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          trend={`${teams.length} teams`}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Incoming Requests */}
        <Card title="Incoming Requests">
          {loading ? (
            <p className="text-sm text-gray-400">Loading requests...</p>
          ) : pendingRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No pending requests.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {pendingRequests.slice(0, 5).map((req) => (
                <li key={req.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{req.student?.name || "Student"}</p>
                    <p className="text-xs text-gray-500">
                      {req.purpose || "Appointment request"} &middot; {req.date}
                    </p>
                  </div>
                  <Badge status={req.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Mentored Projects */}
        <Card title="Mentored Projects">
          {loading ? (
            <p className="text-sm text-gray-400">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-gray-500">No projects assigned.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {projects.slice(0, 5).map((proj) => (
                <li key={proj.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{proj.title}</p>
                    <p className="text-xs text-gray-500">
                      Phase: {proj.current_phase ? String(proj.current_phase).replace("_", " ") : "Not started"}
                    </p>
                  </div>
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
