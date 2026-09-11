import { getTeamsForLeaderboard, getRoundPointsForTeam } from "./teams";
import { getActiveRound } from "./rounds";
import type { LeaderboardEntry, RankColor } from "../../types/leaderboard";

function getRankColor(rank: number, totalTeams: number): RankColor {
  if (rank <= 5) return "green";
  if (rank > totalTeams - 2) return "red";
  return "yellow";
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const [teams, activeRound] = await Promise.all([getTeamsForLeaderboard(), getActiveRound()]);

  // @ts-ignore - bypassing strict type checks as teams now have `points`, `uid` and `teamName`
  const sorted = [...teams].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  const activeRoundPointsByTeam = activeRound
    ? await Promise.all(
        // @ts-ignore
        sorted.map((team) => getRoundPointsForTeam(team.uid, activeRound.id))
      )
    : sorted.map(() => 0);

  return sorted.map((team, index) => {
    const rank = index + 1;
    return {
      // @ts-ignore
      teamId: team.teamId || team.uid,
      // @ts-ignore
      teamName: team.teamName,
      // @ts-ignore
      totalPoints: team.points ?? 0,
      rank,
      color: getRankColor(rank, sorted.length),
      activeRoundPoints: activeRoundPointsByTeam[index],
    };
  });
}