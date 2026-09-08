"use client";

import { useState } from "react";
import type { LeaderboardEntry } from "../../types/leaderboard";

interface ScoreAssignFormProps {
  entries: LeaderboardEntry[];
  activeRoundName?: string;
  onAssigned: () => void;
}

export function ScoreAssignForm({
  entries,
  activeRoundName,
  onAssigned,
}: ScoreAssignFormProps) {
  const [teamId, setTeamId] = useState("");
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const pointsValue = Number(points);
    if (!teamId) return setError("Choose a team.");
    if (!Number.isFinite(pointsValue) || pointsValue === 0) {
      return setError("Enter a non-zero number of points.");
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, points: pointsValue, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't assign points.");
      
      onAssigned();
      setPoints("");
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/10 bg-black/40 p-5"
    >
      <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-red-500">
        Assign points ({activeRoundName ?? "Active Round"})
      </h2>

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_2fr_auto]">
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-[#f0e6d3] outline-none focus:border-red-500/60"
        >
          <option value="">Select team...</option>
          {entries.map((entry) => (
            <option key={entry.teamId} value={entry.teamId}>
              {entry.teamName} ({entry.totalPoints} pts)
            </option>
          ))}
        </select>

        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="+/- pts"
          className="rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-[#f0e6d3] outline-none focus:border-red-500/60"
        />

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-[#f0e6d3] outline-none focus:border-red-500/60"
        />

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-[#f0e6d3] transition hover:bg-red-500 disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Assign"}
        </button>
      </div>

      {error && <p className="mt-3 font-mono text-xs text-red-400">{error}</p>}
    </form>
  );
}