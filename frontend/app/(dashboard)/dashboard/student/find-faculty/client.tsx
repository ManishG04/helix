"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Mail, BookOpen, Calendar } from "lucide-react";
import { Input, Button, Badge } from "@/components/ui";
import api from "@/lib/api";
import type { User, FacultyAvailability, PaginatedResponse } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function FacultyCard({ faculty }: { faculty: User }) {
  const [slots, setSlots] = useState<FacultyAvailability[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadSlots = useCallback(async () => {
    if (slots.length > 0) { setExpanded(true); return; }
    setLoadingSlots(true);
    try {
      const res = await api.get<FacultyAvailability[]>(`/faculty/${faculty.id}/availability`);
      setSlots(res.data.filter((s) => s.status === "ACTIVE"));
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
      setExpanded(true);
    }
  }, [faculty.id, slots.length]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
            {faculty.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{faculty.name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {faculty.email}
            </p>
          </div>
        </div>
        <Badge variant="info">Faculty</Badge>
      </div>

      {faculty.academic_interests && (
        <p className="text-xs text-gray-600 flex items-start gap-1.5">
          <BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-400" />
          {faculty.academic_interests}
        </p>
      )}

      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Calendar className="h-3.5 w-3.5" />}
        isLoading={loadingSlots}
        onClick={() => (expanded ? setExpanded(false) : loadSlots())}
        className="self-start text-xs"
      >
        {expanded ? "Hide availability" : "View availability"}
      </Button>

      {expanded && (
        <div className="mt-1">
          {slots.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No active availability slots.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {slots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-xs text-gray-700"
                >
                  <span className="font-medium">{DAYS[slot.day_of_week]}</span>
                  <span>
                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                  </span>
                  <span className="text-gray-400">{slot.slot_duration} min</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function FindFacultyClient() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [faculty, setFaculty] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, size: PAGE_SIZE };
    if (debouncedSearch) params.search = debouncedSearch;

    api
      .get<PaginatedResponse<User>>("/users/faculty", { params })
      .then((res) => {
        setFaculty(res.data.items);
        setTotal(res.data.total);
      })
      .catch(() => {
        // Mock fallback
        const mock: User[] = [
          {
            id: "f1",
            name: "Dr. Anita Sharma",
            email: "anita.sharma@helix.dev",
            role: "FACULTY" as const,
            academic_interests: "Machine Learning, Data Science, Cloud Computing",
            created_at: "2026-01-01T00:00:00Z",
          },
          {
            id: "f2",
            name: "Prof. Ravi Kumar",
            email: "ravi.kumar@helix.dev",
            role: "FACULTY" as const,
            academic_interests: "Blockchain, Distributed Systems",
            created_at: "2026-01-01T00:00:00Z",
          },
          {
            id: "f3",
            name: "Dr. Priya Menon",
            email: "priya.menon@helix.dev",
            role: "FACULTY" as const,
            academic_interests: "Computer Vision, Robotics, Embedded Systems",
            created_at: "2026-01-01T00:00:00Z",
          },
        ].filter(
          (f) =>
            !debouncedSearch ||
            f.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (f.academic_interests ?? "").toLowerCase().includes(debouncedSearch.toLowerCase())
        );
        setFaculty(mock);
        setTotal(mock.length);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Find Faculty</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Browse faculty members and their availability to book appointments.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name or research interests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400">
          Loading…
        </div>
      ) : faculty.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
          <Search className="h-8 w-8" />
          <p className="text-sm">No faculty found{debouncedSearch ? ` for "${debouncedSearch}"` : ""}.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {faculty.map((f) => (
              <FacultyCard key={f.id} faculty={f} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
