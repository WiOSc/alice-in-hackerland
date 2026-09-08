import { cn } from "../../lib/utils";
import type { RankColor } from "../../types/leaderboard";

const COLOR_STYLES: Record<RankColor, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  yellow: "bg-amber-400/15 text-amber-300 border-amber-400/40",
  red: "bg-red-500/15 text-red-400 border-red-500/40",
};

export function RankBadge({ rank, color }: { rank: number; color: RankColor }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border font-mono text-sm font-bold",
        COLOR_STYLES[color]
      )}
    >
      {rank}
    </span>
  );
}
