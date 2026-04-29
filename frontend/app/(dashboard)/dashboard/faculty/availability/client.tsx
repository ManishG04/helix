"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, CalendarClock, Upload } from "lucide-react";
import { Button, Input, Badge } from "@/components/ui";
import { FacultyAvailabilityService, TimetableOcrService } from "@/src/api";
import type { FacultyAvailability, FacultyAvailabilityCreate, DayOfWeek } from "@/src/api";
import { AvailabilityStatus, AvailabilitySource } from "@/src/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Add Slot Modal ───────────────────────────────────────────────────────────

function AddSlotModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (slot: FacultyAvailability) => void;
}) {
  const [day, setDay] = useState<DayOfWeek>(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (start >= end) { setError("End time must be after start time."); return; }
    setLoading(true);
    setError("");
    const payload: FacultyAvailabilityCreate = {
      day_of_week: day,
      start_time: `${start}:00`,
      end_time: `${end}:00`,
    };
    try {
      const r = await FacultyAvailabilityService.addAvailability(payload);
      onAdded(r);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (detail?.includes("409") || detail?.includes("overlap")) {
        setError("This slot overlaps with an existing one.");
        setLoading(false);
        return;
      }
      setError(detail ?? "Failed to add slot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Add Availability Slot</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Day of Week</label>
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value) as DayOfWeek)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DAYS.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <Input
              label="End Time"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={loading}>
              Add Slot
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Slot Row ─────────────────────────────────────────────────────────────────

function SlotRow({
  slot,
  onDelete,
  onActivate,
}: {
  slot: FacultyAvailability;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [activating, setActivating] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this slot?")) return;
    setDeleting(true);
    try {
      await FacultyAvailabilityService.deleteAvailability(slot.id!);
    } catch {
      setDeleting(false);
      return;
    }
    onDelete(slot.id!);
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      await FacultyAvailabilityService.updateAvailability(slot.id!, { status: AvailabilityStatus.ACTIVE });
    } catch {
      setActivating(false);
      return;
    }
    onActivate(slot.id!);
  };

  return (
    <li className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-gray-900">{slot.day_of_week !== undefined ? DAYS[slot.day_of_week] : ""}</p>
        <p className="text-xs text-gray-500">
          {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)} &middot; {slot.slot_duration} min
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge status={slot.status ?? AvailabilityStatus.PENDING_REVIEW} />
        <span className="text-xs text-gray-400 uppercase">{slot.source}</span>
        {slot.status === AvailabilityStatus.PENDING_REVIEW && (
          <Button
            variant="secondary"
            size="sm"
            isLoading={activating}
            onClick={handleActivate}
            className="text-xs"
          >
            Activate
          </Button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
          title="Delete slot"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AvailabilityClient() {
  const [slots, setSlots] = useState<FacultyAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  useEffect(() => {
    FacultyAvailabilityService.getMyAvailability()
      .then((r) => setSlots(r || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAdded = (slot: FacultyAvailability) => {
    setSlots((prev) => [...prev, slot]);
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setSlots((prev: FacultyAvailability[]) => prev.filter((s) => s.id !== id));
  };

  const handleActivate = (id: string) => {
    setSlots((prev: FacultyAvailability[]) =>
      prev.map((s) => (s.id === id ? { ...s, status: AvailabilityStatus.ACTIVE } : s))
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    try {
      await TimetableOcrService.uploadTimetable({ file: file as Blob });
      setUploadMsg("Timetable uploaded. OCR processing in background — slots will appear shortly.");
    } catch {
      setUploadMsg("Failed to upload timetable. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Group by day
  const byDay = DAYS.reduce<Record<number, FacultyAvailability[]>>((acc, _, i) => {
    acc[i] = slots.filter((s) => s.day_of_week === i);
    return acc;
  }, {});

  const activeCount = slots.filter((s) => s.status === AvailabilityStatus.ACTIVE).length;
  const pendingCount = slots.filter((s) => s.status === AvailabilityStatus.PENDING_REVIEW).length;

  return (
    <>
      {showAdd && (
        <AddSlotModal onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Schedule & Availability</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Manage when students can book appointments with you.
            </p>
          </div>
          <div className="flex gap-2">
            {/* OCR upload */}
            <label className={`inline-flex items-center gap-2 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload Timetable"}
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowAdd(true)}
            >
              Add Slot
            </Button>
          </div>
        </div>

        {uploadMsg && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
            {uploadMsg}
          </div>
        )}

        {/* Summary */}
        <div className="flex gap-4">
          <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-2 text-sm text-green-700">
            <span className="font-semibold">{activeCount}</span> active slot{activeCount !== 1 ? "s" : ""}
          </div>
          {pendingCount > 0 && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-100 px-4 py-2 text-sm text-yellow-700">
              <span className="font-semibold">{pendingCount}</span> pending review
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading…</div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <CalendarClock className="h-8 w-8" />
            <p className="text-sm">No availability slots yet.</p>
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>
              Add Slot
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {DAYS.map((dayName, i) => {
              const daySlots = byDay[i];
              if (daySlots.length === 0) return null;
              return (
                <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">{dayName}</p>
                  <ul>
                    {daySlots.map((s) => (
                      <SlotRow
                        key={s.id}
                        slot={s}
                        onDelete={handleDelete}
                        onActivate={handleActivate}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
