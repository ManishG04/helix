"use client";

import React, { useState, useEffect } from "react";
import { ClipboardList, Check, X, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui";
import api from "@/lib/api";
import type { AppointmentWithDetails, PaginatedResponse } from "@/types";

const MOCK_REQUESTS: AppointmentWithDetails[] = [
  {
    id: "a3",
    slot_id: "sl1",
    student_id: "s1",
    faculty_id: "f1",
    team_id: null,
    date: "2026-03-18",
    start_time: "10:00:00",
    end_time: "10:30:00",
    purpose: "Discuss AI project progress and next milestones",
    status: "PENDING",
    student: {
      id: "s1", name: "Alex Student", email: "student@helix.dev",
      role: "STUDENT", academic_interests: null, created_at: "2026-01-01T00:00:00Z",
    },
    faculty: {
      id: "f1", name: "Dr. Anita Sharma", email: "faculty@helix.dev",
      role: "FACULTY", academic_interests: "ML, Data Science", created_at: "2026-01-01T00:00:00Z",
    },
    team: null,
  },
  {
    id: "a4",
    slot_id: "sl2",
    student_id: "s2",
    faculty_id: "f1",
    team_id: null,
    date: "2026-03-20",
    start_time: "14:00:00",
    end_time: "14:30:00",
    purpose: "Initial consultation",
    status: "ACCEPTED",
    student: {
      id: "s2", name: "Jamie Lee", email: "jamie@helix.dev",
      role: "STUDENT", academic_interests: null, created_at: "2026-01-01T00:00:00Z",
    },
    faculty: {
      id: "f1", name: "Dr. Anita Sharma", email: "faculty@helix.dev",
      role: "FACULTY", academic_interests: "ML, Data Science", created_at: "2026-01-01T00:00:00Z",
    },
    team: null,
  },
];

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({
  apt,
  onUpdate,
}: {
  apt: AppointmentWithDetails;
  onUpdate: (id: string, status: "ACCEPTED" | "REJECTED") => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleAction = async (status: "ACCEPTED" | "REJECTED") => {
    if (status === "ACCEPTED") setAccepting(true); else setRejecting(true);
    try {
      await api.put(`/appointments/${apt.id}`, { status });
    } catch { /* mock */ }
    onUpdate(apt.id, status);
    if (status === "ACCEPTED") setAccepting(false); else setRejecting(false);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3">
      {/* Student info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
            {apt.student.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{apt.student.name}</p>
            <p className="text-xs text-gray-400">{apt.student.email}</p>
          </div>
        </div>
        <Badge status={apt.status} />
      </div>

      {/* Date / time */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Clock className="h-3.5 w-3.5" />
        {apt.date} &middot; {apt.start_time.slice(0, 5)} – {apt.end_time.slice(0, 5)}
      </div>

      {/* Purpose */}
      {apt.purpose && (
        <p className="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2 italic">
          &ldquo;{apt.purpose}&rdquo;
        </p>
      )}

      {/* Actions */}
      {apt.status === "PENDING" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleAction("ACCEPTED")}
            disabled={accepting || rejecting}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {accepting ? (
              <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Accept
          </button>
          <button
            onClick={() => handleAction("REJECTED")}
            disabled={accepting || rejecting}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {rejecting ? (
              <span className="h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RequestsClient() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");

  useEffect(() => {
    api
      .get<PaginatedResponse<AppointmentWithDetails>>("/appointments")
      .then((r) => setAppointments(r.data.items))
      .catch(() => setAppointments(MOCK_REQUESTS))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (id: string, status: "ACCEPTED" | "REJECTED") => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const filtered = filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter);
  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">Manage Requests</h1>
          {pendingCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-100 px-1.5 text-xs font-semibold text-yellow-700">
              {pendingCount}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          Review and respond to student appointment requests.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["ALL", "PENDING", "ACCEPTED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <ClipboardList className="h-8 w-8" />
          <p className="text-sm">
            {filter === "ALL" ? "No appointment requests." : `No ${filter.toLowerCase()} requests.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <RequestCard key={a.id} apt={a} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
