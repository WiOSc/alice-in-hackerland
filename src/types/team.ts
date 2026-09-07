// NOTE: If you already have a types/team.ts, merge these fields into your
// existing Team interface instead of overwriting it. The leaderboard feature
// only depends on: id, name, totalPoints.

export interface Team {
  id: string;
  name: string;
  members: string[];
  totalPoints: number; // cumulative score across all rounds, admin-editable
  createdAt: string;
  updatedAt: string;
}
