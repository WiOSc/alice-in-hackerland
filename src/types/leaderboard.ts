export type RankColor = "green" | "yellow" | "red";

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  totalPoints: number;
  rank: number;
  color: RankColor;
  activeRoundPoints: number; // points earned in the currently active round
}

export interface AssignPointsInput {
  teamId: string;
  points: number; // delta, can be negative to deduct
  note?: string;
}

export interface RoundScoreEntry {
  roundId: string;
  points: number;
  note?: string;
  updatedAt: string;
  updatedBy: string; // admin uid
}
