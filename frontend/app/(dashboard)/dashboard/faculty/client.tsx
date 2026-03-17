"use client";

import React from "react";
import {
  CalendarClock,
  BookOpen,
  ClipboardList,
  Users,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { Card, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";

const PLACEHOLDER_REQUESTS = [
  { student: "Arjun Mehta", topic: "ML Research Collaboration", date: "Mar 17, 2026", status: "PENDING" as const },
  { student: "Priya Singh", topic: "Web3 Project Guidance", date: "Mar 15, 2026", status: "ACCEPTED" as const },
];

const PLACEHOLDER_PROJECTS = [
  { title: "AI-Based Crop Disease Detection", students: 3, status: "APPROVED" as const, phase: "MID_TERM" as const },
  { title: "Smart Grid Optimization", students: 2, status: "PROPOSED" as const, phase: "SYNOPSIS" as const },
];

export default function FacultyDashboardClient() {
  const { user } = useAuthStore();

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
          value={3}
          icon={CalendarClock}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend="Next at 11:00 AM"
        />
        <StatCard
          label="Mentored Projects"
          value={2}
          icon={BookOpen}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          label="Pending Requests"
          value={1}
          icon={ClipboardList}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
          trend="Needs your review"
        />
        <StatCard
          label="Total Students"
          value={5}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          trend="Across all projects"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Incoming Requests */}
        <Card title="Incoming Requests">
          <ul className="flex flex-col gap-3">
            {PLACEHOLDER_REQUESTS.map((req, i) => (
              <li key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{req.student}</p>
                  <p className="text-xs text-gray-500">
                    {req.topic} &middot; {req.date}
                  </p>
                </div>
                <Badge status={req.status} />
              </li>
            ))}
          </ul>
        </Card>

        {/* Mentored Projects */}
        <Card title="Mentored Projects">
          <ul className="flex flex-col gap-3">
            {PLACEHOLDER_PROJECTS.map((proj, i) => (
              <li key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{proj.title}</p>
                  <p className="text-xs text-gray-500">{proj.students} students &middot; Phase: {proj.phase.replace("_", " ")}</p>
                </div>
                <Badge status={proj.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
