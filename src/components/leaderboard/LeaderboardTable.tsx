"use client";

import { RankBadge } from "./RankBadge";
import type { LeaderboardEntry } from "../../types/leaderboard";

export function LeaderboardTable({
  entries,
  currentTeamId,
  emptyMessage = "No teams on the board yet.",
}: {
  entries: LeaderboardEntry[];
  currentTeamId?: string;
  emptyMessage?: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/40 p-8 text-center font-mono text-sm text-white/40">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10 font-mono text-xs uppercase tracking-wider text-white/40">
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3 text-right">This Round</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.teamId}
              className={
                entry.teamId === currentTeamId
                  ? "border-b border-white/5 bg-red-500/5"
                  : "border-b border-white/5 last:border-0"
              }
            >
              <td className="px-4 py-3">
                <RankBadge rank={entry.rank} color={entry.color} />
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-[#f0e6d3]">{entry.teamName}</span>
                {entry.teamId === currentTeamId && (
                  <span className="ml-2 font-mono text-xs text-red-400">(you)</span>
                )}
              </td>
              <td className="px-4 py-3 text-right font-mono text-white/60">
                {entry.activeRoundPoints > 0 ? `+${entry.activeRoundPoints}` : entry.activeRoundPoints}
              </td>
              <td className="px-4 py-3 text-right font-mono text-lg font-bold text-[#f0e6d3]">
                {entry.totalPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
