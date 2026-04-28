"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { ProjectsService, ProjectStatus, ProjectPhase } from "@/src/api";
import type { Project } from "@/src/api";

const PHASE_ORDER = ["SYNOPSIS", "MID_TERM", "FINAL_EVALUATION"] as const;

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onAdvance,
}: {
  project: Project;
  onAdvance: (id: string) => void;
}) {
  const [advancing, setAdvancing] = useState(false);

  const canAdvance =
    project.status === "APPROVED" &&
    project.current_phase !== "FINAL_EVALUATION";

  const nextPhase = () => {
    if (!project.current_phase) return "SYNOPSIS";
    const idx = PHASE_ORDER.indexOf(project.current_phase as (typeof PHASE_ORDER)[number]);
    return idx < PHASE_ORDER.length - 1 ? PHASE_ORDER[idx + 1] : null;
  };

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      await ProjectsService.advanceProjectPhase(project.id!);
    } catch {
      setAdvancing(false);
      return;
    }
    onAdvance(project.id!);
    setAdvancing(false);
  };

  const next = nextPhase();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{project.title}</p>
        <Badge status={project.status} />
      </div>

      {project.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
      )}

      {/* Phase tracker */}
      <div className="flex items-center gap-1 mt-1">
        {PHASE_ORDER.map((phase, i) => {
          const current = project.current_phase === phase;
          const done =
            project.current_phase !== null &&
            PHASE_ORDER.indexOf(project.current_phase as (typeof PHASE_ORDER)[number]) > i;
          return (
            <React.Fragment key={phase}>
              <div
                className={`flex-1 rounded-full h-1.5 ${
                  done
                    ? "bg-green-400"
                    : current
                    ? "bg-indigo-500"
                    : "bg-gray-200"
                }`}
                title={phase.replace("_", " ")}
              />
              {i < PHASE_ORDER.length - 1 && (
                <div className="w-1 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {project.current_phase ? (
          <Badge status={project.current_phase} />
        ) : (
          <span className="text-xs text-gray-400">No phase set</span>
        )}
        <span className="font-mono text-gray-500">
          {(new Date(project.created_at || "")).toLocaleDateString()}
        </span>
      </div>

      {canAdvance && next && (
        <Button
          variant="secondary"
          size="sm"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          isLoading={advancing}
          onClick={handleAdvance}
          className="self-start text-xs"
        >
          Advance to {next.replace("_", " ")}
        </Button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FacultyProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | ProjectStatus>("ALL");

  useEffect(() => {
    ProjectsService.listProjects()
      .then((r) => setProjects(r.items as Project[] || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAdvance = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        let nextPhase = ProjectPhase.SYNOPSIS;
        if (p.current_phase === ProjectPhase.SYNOPSIS) nextPhase = ProjectPhase.MID_TERM;
        if (p.current_phase === ProjectPhase.MID_TERM) nextPhase = ProjectPhase.FINAL_EVALUATION;
        return { ...p, current_phase: nextPhase };
      })
    );
  };

  const filtered = filter === "ALL" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mentored Projects</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Track and advance your mentored student projects through each phase.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["ALL", ProjectStatus.PROPOSED, ProjectStatus.APPROVED, ProjectStatus.COMPLETED] as const).map((state) => (
          <button
            key={state}
            onClick={() => setFilter(state)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === state
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {state === "ALL" ? "All" : state.charAt(0) + state.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <BookOpen className="h-8 w-8" />
          <p className="text-sm">
            {filter === "ALL" ? "No mentored projects yet." : `No ${filter.toLowerCase()} projects.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onAdvance={handleAdvance} />
          ))}
        </div>
      )}
    </div>
  );
}
