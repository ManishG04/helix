"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck, CalendarPlus, X, Clock } from "lucide-react";
import { Button, Input, Badge } from "@/components/ui";
import { UsersService, FacultyAvailabilityService, AppointmentsService, AppointmentStatus } from "@/src/api";
import type {
  AppointmentWithDetails,
  FacultyAvailability,
  User as UserType,
  AppointmentCreate,
} from "@/src/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Book Appointment Modal ───────────────────────────────────────────────────

function BookModal({
  onClose,
  onBooked,
}: {
  onClose: () => void;
  onBooked: (a: AppointmentWithDetails) => void;
}) {
  const [step, setStep] = useState<"faculty" | "slot" | "confirm">("faculty");
  const [facultySearch, setFacultySearch] = useState("");
  const [facultyList, setFacultyList] = useState<UserType[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<UserType | null>(null);
  const [slots, setSlots] = useState<FacultyAvailability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<FacultyAvailability | null>(null);
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load faculty
  useEffect(() => {
    UsersService.listFaculty(1, 20, facultySearch || undefined)
      .then((r) => setFacultyList(r.items as UserType[] || []))
      .catch(() => setFacultyList([]));
  }, [facultySearch]);

  const selectFaculty = async (f: UserType) => {
    setSelectedFaculty(f);
    setLoading(true);
    try {
      const data = await FacultyAvailabilityService.getFacultyAvailability(f.id!);
      setSlots(data.filter((s) => s.status === "ACTIVE"));
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
      setStep("slot");
    }
  };

  const handleBook = async () => {
    if (!selectedFaculty || !selectedSlot || !date) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    const payload: AppointmentCreate = {
      slot_id: selectedSlot.id!,
      date,
      start_time: selectedSlot.start_time!,
      end_time: selectedSlot.end_time!,
      faculty_id: selectedFaculty.id!,
      purpose: purpose || null,
    };
    try {
      const r = await AppointmentsService.createAppointment(payload);
      onBooked(r as unknown as AppointmentWithDetails);
    } catch {
      setError("Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Book Appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Step 1: Choose faculty */}
          {step === "faculty" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-600">Select a faculty member:</p>
              <Input
                placeholder="Search by name…"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
              />
              <ul className="flex flex-col gap-1 mt-1">
                {facultyList.map((f) => (
                  <li key={f.id}>
                    <button
                      onClick={() => selectFaculty(f)}
                      className="w-full text-left rounded-lg px-3 py-2.5 hover:bg-indigo-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{f.name}</p>
                      {f.academic_interests && (
                        <p className="text-xs text-gray-400 truncate">{f.academic_interests}</p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 2: Choose slot */}
          {step === "slot" && (
            <div className="flex flex-col gap-3">
              <button
                className="text-xs text-indigo-600 hover:underline self-start"
                onClick={() => { setStep("faculty"); setSelectedFaculty(null); setSlots([]); }}
              >
                ← Change faculty
              </button>
              <p className="text-sm text-gray-600">
                Available slots for <strong>{selectedFaculty?.name}</strong>:
              </p>
              {loading ? (
                <p className="text-sm text-gray-400">Loading slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No active availability slots found.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {slots.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => { setSelectedSlot(s); setStep("confirm"); }}
                        className="w-full text-left rounded-lg border border-gray-200 px-3 py-2.5 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {DAYS[s.day_of_week ?? 0]} &middot; {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                        </p>
                        <p className="text-xs text-gray-400">{s.slot_duration} min</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && selectedFaculty && selectedSlot && (
            <div className="flex flex-col gap-4">
              <button
                className="text-xs text-indigo-600 hover:underline self-start"
                onClick={() => { setStep("slot"); setSelectedSlot(null); }}
              >
                ← Change slot
              </button>
              <div className="rounded-lg bg-gray-50 px-4 py-3 flex flex-col gap-1 text-sm">
                <p><span className="text-gray-500">Faculty:</span> <strong>{selectedFaculty.name}</strong></p>
                <p><span className="text-gray-500">Slot:</span> {DAYS[selectedSlot.day_of_week ?? 0]}, {selectedSlot.start_time?.slice(0, 5)} – {selectedSlot.end_time?.slice(0, 5)}</p>
              </div>
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Purpose (optional)</label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Reason for appointment…"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button variant="primary" size="sm" isLoading={loading} onClick={handleBook}>
                Confirm Booking
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Appointment Row ──────────────────────────────────────────────────────────

function AppointmentRow({
  apt,
  onCancel,
}: {
  apt: AppointmentWithDetails;
  onCancel: (id: string) => void;
}) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Cancel this appointment?")) return;
    setCancelling(true);
    try {
      await AppointmentsService.cancelAppointment(apt.id!);
    } catch {
      setCancelling(false);
      return;
    }
    onCancel(apt.id!);
  };

  return (
    <li className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
            {apt.faculty?.name?.[0]?.toUpperCase() || "F"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{apt.faculty?.name}</p>
            <p className="text-xs text-gray-400">{apt.faculty?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          {apt.date} &middot; {apt.start_time?.slice(0, 5)} – {apt.end_time?.slice(0, 5)}
        </div>
        {apt.purpose && (
          <p className="text-xs text-gray-400 italic line-clamp-1">{apt.purpose}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge status={apt.status ?? AppointmentStatus.PENDING} />
        {apt.status === AppointmentStatus.PENDING && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AppointmentsClient() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [filter, setFilter] = useState<"ALL" | AppointmentStatus>("ALL");
  useEffect(() => {
    AppointmentsService.listAppointments()
      .then((r) => {
        const list = Array.isArray(r)
          ? (r as AppointmentWithDetails[])
          : ((r.items as AppointmentWithDetails[]) || []);
        setAppointments(list);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? appointments : appointments.filter((a) => a.status === filter);

  const handleBooked = (a: AppointmentWithDetails) => {
    setAppointments((prev) => [a, ...prev]);
    setShowBook(false);
  };

  const handleCancel = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      {showBook && (
        <BookModal onClose={() => setShowBook(false)} onBooked={handleBooked} />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Book and manage your faculty appointments.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CalendarPlus className="h-4 w-4" />}
            onClick={() => setShowBook(true)}
          >
            Book Appointment
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
          {(["ALL", AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED, AppointmentStatus.REJECTED] as const).map((f) => (
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

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <CalendarCheck className="h-8 w-8" />
              <p className="text-sm">
                {filter === "ALL"
                  ? "No appointments yet."
                  : `No ${filter.toLowerCase()} appointments.`}
              </p>
            </div>
          ) : (
            <ul className="px-5">
              {filtered.map((a) => (
                <AppointmentRow key={a.id} apt={a} onCancel={handleCancel} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
