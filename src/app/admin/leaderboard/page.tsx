"use client";

import { useCallback, useEffect, useState } from "react";
import { LeaderboardTable } from "../../../components/leaderboard/LeaderboardTable";
import { ScoreAssignForm } from "../../../components/admin/ScoreAssignForm";
import type { LeaderboardEntry } from "../../../types/leaderboard";
export default function AdminLeaderboardPage(){
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRoundName, setActiveRoundName] = useState<string>("No Active Round");

  const fetchLeaderboard = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch("/api/leaderboard");
    if (!res.ok) throw new Error("Couldn't load the leaderboard.");
    
    const data = await res.json();
    setEntries(data.leaderboard as LeaderboardEntry[]);
    setActiveRoundName(data.activeRoundName ?? "No Active Round");
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
            admin — <span className="text-white">{activeRoundName}</span>
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#f0e6d3]">Leaderboard</h1>
        </div>
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="rounded-md border border-white/15 px-4 py-2 font-mono text-sm text-white/70 transition hover:border-white/30 hover:text-[#f0e6d3]"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6">
        <ScoreAssignForm entries={entries} onAssigned={fetchLeaderboard} />
      </div>

      <LeaderboardTable entries={entries} />
    </div>
  </div>
);
}
/*const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Couldn't load the leaderboard.");
      // Replace line 19:
      setEntries(data.leaderboard as LeaderboardEntry[]);
      setActiveRoundName(data.activeRoundName ?? "No Active Round");
      //const data = await res.json();
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
    //<div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
       <p className="font-mono text-xs uppercase tracking-wider text-red-500">
         admin — <span className="text-white">{activeRoundName}</span>
      </p>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-red-500">
              admin
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

        <ScoreAssignForm entries={entries} onAssigned={fetchLeaderboard} />
        {error && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6">
          <ScoreAssignForm entries={entries} onAssigned={setEntries} />
        </div>

        <LeaderboardTable entries={entries} />
      </div>
    </div>
  );
}*/