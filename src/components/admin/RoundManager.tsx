"use client";

import { useState } from "react";
import type { Round, RoundStatus } from "../../types/round";
import { cn } from "../../lib/utils";

const STATUS_STYLES: Record<RoundStatus, string> = {
  upcoming: "bg-white/5 text-white/50 border-white/15",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  completed: "bg-white/5 text-white/30 border-white/10",
};

export function RoundManager({
  initialRounds,
}: {
  initialRounds: Round[];
}) {
  const [rounds, setRounds] = useState<Round[]>(initialRounds);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setCreating(true);
    try {
      const nextNumber = rounds.length > 0 ? Math.max(...rounds.map((r) => r.roundNumber)) + 1 : 1;
      const res = await fetch("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), roundNumber: nextNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create the round.");
      setRounds((prev) => [...prev, data.round as Round]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(id: string, status: RoundStatus) {
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch("/api/rounds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't update the round.");

      // Activating a round completes any other active round server-side —
      // refetch the full list so the UI reflects that.
      const listRes = await fetch("/api/rounds");
      const listData = await listRes.json();
      setRounds(listData.rounds as Round[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="flex gap-3 rounded-lg border border-white/10 bg-black/40 p-5"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Round name, e.g. Round 3 — Boss Level"
          className="flex-1 rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-[#f0e6d3] outline-none focus:border-red-500/60"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-[#f0e6d3] transition hover:bg-red-500 disabled:opacity-40"
        >
          {creating ? "Creating…" : "New round"}
        </button>
      </form>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {rounds
          .sort((a, b) => a.roundNumber - b.roundNumber)
          .map((round) => (
            <div
              key={round.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-4"
            >
              <div>
                <span className="font-mono text-xs text-white/40">
                  Round {round.roundNumber}
                </span>
                <h3 className="font-medium text-[#f0e6d3]">{round.name}</h3>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "rounded-md border px-2.5 py-1 font-mono text-xs uppercase",
                    STATUS_STYLES[round.status]
                  )}
                >
                  {round.status}
                </span>

                {round.status !== "active" && (
                  <button
                    onClick={() => handleStatusChange(round.id, "active")}
                    disabled={busyId === round.id}
                    className="rounded-md border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-40"
                  >
                    Activate
                  </button>
                )}
                {round.status === "active" && (
                  <button
                    onClick={() => handleStatusChange(round.id, "completed")}
                    disabled={busyId === round.id}
                    className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/5 disabled:opacity-40"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}

        {rounds.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-black/40 p-8 text-center font-mono text-sm text-white/40">
            No rounds yet — create the first one above.
          </div>
        )}
      </div>
    </div>
  );
}
