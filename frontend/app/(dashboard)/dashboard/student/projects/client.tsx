"use client";

import React, { useState, useEffect } from "react";
import { Plus, FolderKanban, Pencil, Trash2, X, Check } from "lucide-react";
import { Button, Input, Badge } from "@/components/ui";
import api from "@/lib/api";
import type { Project, ProjectCreate, PaginatedResponse } from "@/types";

// ─── Create Project Modal ─────────────────────────────────────────────────────

function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: Project) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    setError("");
    try {
      const payload: ProjectCreate = { title: title.trim(), description: description.trim() || null };
      const res = await api.post<Project>("/projects", payload);
      onCreate(res.data);
    } catch {
      // Mock fallback
      const mock: Project = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim() || null,
        mentor_id: null,
        status: "PROPOSED",
        current_phase: null,
        created_at: new Date().toISOString(),
      };
      onCreate(mock);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="e.g. AI-Based Crop Disease Detection"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={error}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Brief description of the project…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Project Row ──────────────────────────────────────────────────────────────

function ProjectRow({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${project.id}`);
    } catch { /* allow mock */ }
    onDelete(project.id);
  };

  return (
    <li className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
        {project.description && (
          <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <Badge status={project.status} />
          {project.current_phase && <Badge status={project.current_phase} />}
          <span className="text-xs text-gray-400">
            Created {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      {project.status === "PROPOSED" && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
          title="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    title: "AI-Based Crop Disease Detection",
    description: "Using CNNs to identify crop diseases from leaf images.",
    mentor_id: "f1",
    status: "APPROVED",
    current_phase: "MID_TERM",
    created_at: "2026-01-10T00:00:00Z",
  },
  {
    id: "p2",
    title: "Blockchain Supply Chain",
    description: "Transparent supply chain tracking using Ethereum.",
    mentor_id: null,
    status: "PROPOSED",
    current_phase: null,
    created_at: "2026-02-20T00:00:00Z",
  },
];

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api
      .get<PaginatedResponse<Project>>("/projects")
      .then((res) => setProjects(res.data.items))
      .catch(() => setProjects(MOCK_PROJECTS))
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (p: Project) => {
    setProjects((prev) => [p, ...prev]);
    setShowCreate(false);
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreated} />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Projects</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Manage your project proposals and track their progress.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreate(true)}
          >
            New Project
          </Button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              Loading…
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <FolderKanban className="h-8 w-8" />
              <p className="text-sm">No projects yet. Create your first project.</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowCreate(true)}
              >
                New Project
              </Button>
            </div>
          ) : (
            <ul className="px-5 divide-y divide-gray-50">
              {projects.map((p) => (
                <ProjectRow key={p.id} project={p} onDelete={handleDelete} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
