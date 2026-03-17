"use client";

import React, { useState, useEffect } from "react";
import { Search, Trash2, Users } from "lucide-react";
import { Input, Badge } from "@/components/ui";
import api from "@/lib/api";
import type { User, UserRole, PaginatedResponse } from "@/types";

const MOCK_USERS: User[] = [
  { id: "s1", name: "Alex Student", email: "student@helix.dev", role: "STUDENT", academic_interests: null, created_at: "2026-01-10T00:00:00Z" },
  { id: "f1", name: "Dr. Anita Sharma", email: "faculty@helix.dev", role: "FACULTY", academic_interests: "ML, Data Science", created_at: "2026-01-05T00:00:00Z" },
  { id: "a1", name: "Admin User", email: "admin@helix.dev", role: "ADMIN", academic_interests: null, created_at: "2026-01-01T00:00:00Z" },
  { id: "f2", name: "Prof. Ravi Kumar", email: "ravi.kumar@helix.dev", role: "FACULTY", academic_interests: "Blockchain, Distributed Systems", created_at: "2026-01-08T00:00:00Z" },
  { id: "s2", name: "Jamie Lee", email: "jamie@helix.dev", role: "STUDENT", academic_interests: null, created_at: "2026-02-15T00:00:00Z" },
];

const ROLE_COLORS: Record<UserRole, string> = {
  STUDENT: "bg-blue-100 text-blue-700",
  FACULTY: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
};

// ─── User Row ─────────────────────────────────────────────────────────────────

function UserRow({
  user,
  onDelete,
}: {
  user: User;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${user.id}`);
    } catch { /* allow mock */ }
    onDelete(user.id);
  };

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
            {user.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
          {user.role}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-500 hidden md:table-cell">
        {user.academic_interests ?? <span className="text-gray-300">—</span>}
      </td>
      <td className="py-3 px-4 text-xs text-gray-400 hidden sm:table-cell">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="py-3 px-4 text-right">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors"
          title="Delete user"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManageUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, size: PAGE_SIZE };
    if (debouncedSearch) params.search = debouncedSearch;
    if (roleFilter !== "ALL") params.role = roleFilter;

    api
      .get<PaginatedResponse<User>>("/users", { params })
      .then((r) => {
        setUsers(r.data.items);
        setTotal(r.data.total);
      })
      .catch(() => {
        const filtered = MOCK_USERS.filter((u) => {
          const matchRole = roleFilter === "ALL" || u.role === roleFilter;
          const matchSearch =
            !debouncedSearch ||
            u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(debouncedSearch.toLowerCase());
          return matchRole && matchSearch;
        });
        setUsers(filtered);
        setTotal(filtered.length);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, roleFilter, page]);

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setTotal((t) => t - 1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manage Users</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          View, search and delete user accounts across all roles.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xs w-full">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {(["ALL", "STUDENT", "FACULTY", "ADMIN"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                roleFilter === r
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Users className="h-8 w-8" />
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Interests</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Joined</th>
                <th className="py-2.5 px-4" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow key={u.id} user={u} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
