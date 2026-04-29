"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, Copy, Check, X, Crown, LogOut } from "lucide-react";
import { Button, Input, Badge } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { ProjectsService, TeamsService } from "@/src/api";
import type { TeamWithMembers, Project, TeamCreate } from "@/src/api";

// ─── Join Team Modal ──────────────────────────────────────────────────────────

function JoinTeamModal({
  onClose,
  onJoined,
}: {
  onClose: () => void;
  onJoined: (team: TeamWithMembers) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError("Enter a join code."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await TeamsService.joinTeam({ join_code: code.trim().toUpperCase() });
      if (!res.id) {
        setError("Joined team, but failed to load team details.");
        return;
      }
      const fullTeam = await TeamsService.getTeam(res.id);
      onJoined(fullTeam);
    } catch (err: any) {
      const detail = err.body?.detail;
      setError(detail ?? "Invalid join code or you are already in a team.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Join a Team</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Join Code"
            placeholder="e.g. ALPHA2026"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            error={error}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={loading}>
              Join Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateTeamModal({
  projects,
  onClose,
  onCreated,
}: {
  projects: Project[];
  onClose: () => void;
  onCreated: (team: TeamWithMembers) => void;
}) {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) {
      setError("Team name and project are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload: TeamCreate = {
        name: name.trim(),
        project_id: projectId,
      };
      const created = await TeamsService.createTeam(payload);
      if (!created.id) {
        setError("Team was created but could not be loaded.");
        return;
      }
      const fullTeam = await TeamsService.getTeam(created.id);
      onCreated(fullTeam);
    } catch (err: any) {
      const detail = err.body?.detail;
      setError(detail ?? "Failed to create team.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Create a Team</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Team Name"
            placeholder="e.g. Team Helix"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={loading}>
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({
  team,
  currentUserId,
  onLeave,
}: {
  team: TeamWithMembers;
  currentUserId: string;
  onLeave: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isLeader = team.members?.find((m) => m.member_id === currentUserId)?.is_leader ?? false;

  const copyCode = () => {
    if (!team.join_code) return;
    navigator.clipboard.writeText(team.join_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeave = async () => {
    if (!confirm("Leave this team?")) return;
    setLeaving(true);
    try {
      if (team.id) await TeamsService.removeTeamMember(team.id, currentUserId);
    } catch {
      setLeaving(false);
      return;
    }
    if (team.id) onLeave(team.id);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{team.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {team.members?.length ?? 0} member{(team.members?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {isLeader && <Badge variant="purple">Leader</Badge>}
      </div>

      {/* Members */}
      <ul className="flex flex-col gap-2">
        {team.members?.map((m) => (
          <li key={m.member_id} className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold shrink-0">
              {m.member?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 flex-1 truncate">{m.member?.name}</span>
            {m.is_leader && (
              <span title="Team leader">
                <Crown className="h-3.5 w-3.5 text-yellow-500" />
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
        <span className="text-xs text-gray-500">Join code:</span>
        <code className="text-xs font-mono font-semibold text-indigo-700 flex-1">{team.join_code}</code>
        <button
          onClick={copyCode}
          className="text-gray-400 hover:text-indigo-600 transition-colors"
          title="Copy join code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!isLeader && (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<LogOut className="h-3.5 w-3.5" />}
          isLoading={leaving}
          onClick={handleLeave}
          className="self-start text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
        >
          Leave Team
        </Button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamsClient() {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    Promise.all([TeamsService.listTeams(), ProjectsService.listProjects(1, 100)])
      .then(async ([teamsRes, projectsRes]) => {
        const rawTeamList = Array.isArray(teamsRes)
          ? (teamsRes as TeamWithMembers[])
          : ((teamsRes.items as unknown as TeamWithMembers[]) || []);
        const teamList = await Promise.all(
          rawTeamList.map(async (t) => {
            if (!t.id) return t;
            try {
              return await TeamsService.getTeam(t.id);
            } catch {
              return t;
            }
          })
        );
        const projectList = Array.isArray(projectsRes)
          ? (projectsRes as Project[])
          : (projectsRes.items || []);
        setTeams(teamList);
        setProjects(projectList);
      })
      .catch(() => {
        setTeams([]);
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const availableProjects = projects.filter(
    (p) => p.id && !teams.some((t) => t.project_id === p.id)
  );

  const handleJoined = (team: TeamWithMembers) => {
    setTeams((prev) =>
      prev.some((t) => t.id === team.id) ? prev : [team, ...prev]
    );
    setShowJoin(false);
  };

  const handleCreated = (team: TeamWithMembers) => {
    setTeams((prev) => [team, ...prev]);
    setShowCreate(false);
  };

  const handleLeave = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {showCreate && (
        <CreateTeamModal
          projects={availableProjects}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
      {showJoin && (
        <JoinTeamModal onClose={() => setShowJoin(false)} onJoined={handleJoined} />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Teams</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Create teams for your projects or join using a code.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreate(true)}
              disabled={availableProjects.length === 0}
            >
              Create Team
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowJoin(true)}
            >
              Join Team
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading…
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Users className="h-8 w-8" />
            <p className="text-sm">You are not in any team yet.</p>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowCreate(true)}
                disabled={availableProjects.length === 0}
              >
                Create Team
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowJoin(true)}
              >
                Join Team
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teams.map((t) => (
              <TeamCard
                key={t.id}
                team={t}
                currentUserId={user?.id ?? ""}
                onLeave={handleLeave}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
