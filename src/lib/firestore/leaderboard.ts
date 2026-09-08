import { listTeams, getRoundPointsForTeam } from "./teams";
import { getActiveRound } from "./rounds";
import type { LeaderboardEntry, RankColor } from "../../types/leaderboard";

function getRankColor(rank: number, totalTeams: number): RankColor {
  if (rank <= 5) return "green";
  if (rank > totalTeams - 2) return "red";
  return "yellow";
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const [teams, activeRound] = await Promise.all([listTeams(), getActiveRound()]);

  const sorted = [...teams].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));

  const activeRoundPointsByTeam = activeRound
    ? await Promise.all(
        sorted.map((team) => getRoundPointsForTeam(team.id, activeRound.id))
      )
    : sorted.map(() => 0);

  return sorted.map((team, index) => {
    const rank = index + 1;
    return {
      teamId: team.id,
      teamName: team.name,
      totalPoints: team.totalPoints ?? 0,
      rank,
      color: getRankColor(rank, sorted.length),
      activeRoundPoints: activeRoundPointsByTeam[index],
    };
  });
}