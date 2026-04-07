"use client";

import React from "react";
import {
  CalendarCheck,
  FolderKanban,
  UsersRound,
  Clock,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Card, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";

const PLACEHOLDER_APPOINTMENTS = [
  { faculty: "Dr. Anita Sharma", date: "Mar 18, 2026", time: "10:00 AM", status: "ACCEPTED" as const },
  { faculty: "Prof. Ravi Kumar", date: "Mar 20, 2026", time: "2:00 PM", status: "PENDING" as const },
];

const PLACEHOLDER_PROJECTS = [
  { title: "AI-Based Crop Disease Detection", status: "APPROVED" as const },
  { title: "Blockchain Supply Chain", status: "PROPOSED" as const },
];

export default function StudentDashboardClient() {
  const { user } = useAuthStore();

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
          value={2}
          icon={CalendarCheck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend="Next: Mar 18"
        />
        <StatCard
          label="Active Projects"
          value={1}
          icon={FolderKanban}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          trend="1 in progress"
        />
        <StatCard
          label="My Teams"
          value={2}
          icon={UsersRound}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Pending Requests"
          value={1}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
          trend="Awaiting faculty response"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card title="Upcoming Appointments">
          <ul className="flex flex-col gap-3">
            {PLACEHOLDER_APPOINTMENTS.map((apt, i) => (
              <li key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{apt.faculty}</p>
                  <p className="text-xs text-gray-500">
                    {apt.date} &middot; {apt.time}
                  </p>
                </div>
                <Badge status={apt.status} />
              </li>
            ))}
          </ul>
        </Card>

        {/* My Projects */}
        <Card title="My Projects">
          <ul className="flex flex-col gap-3">
            {PLACEHOLDER_PROJECTS.map((proj, i) => (
              <li key={i} className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{proj.title}</p>
                <Badge status={proj.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
