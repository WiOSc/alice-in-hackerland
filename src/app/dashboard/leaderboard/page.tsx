"use client";

import { useCallback, useEffect, useState } from "react";
import { LeaderboardTable } from "../../../components/leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "../../../types/leaderboard";
import { useTeam } from "../../../hooks/useTeam";

export default function DashboardLeaderboardPage() {
  const { team } = useTeam(); // expected to expose { team: { id, name, ... } | null }
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Couldn't load the leaderboard.");
      const data = await res.json();
      setEntries(data.leaderboard as LeaderboardEntry[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-red-500">
              standings
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#f0e6d3]">Leaderboard</h1>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="rounded-md border border-white/15 px-4 py-2 font-mono text-sm text-white/70 transition hover:border-white/30 hover:text-[#f0e6d3] disabled:opacity-40"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-400">
            {error}
          </div>
        )}

        <LeaderboardTable entries={entries} currentTeamId={team?.id} />

        <div className="mt-6 flex gap-4 font-mono text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> top 5
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> mid pack
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" /> last 2
          </span>
        </div>
      </div>
    </div>
  );
}
