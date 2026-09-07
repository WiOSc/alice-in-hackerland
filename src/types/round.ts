export type RoundStatus = "upcoming" | "active" | "completed";

export interface Round {
  id: string;
  roundNumber: number;
  name: string;
  description?: string;
  status: RoundStatus;
  startTime: string | null; // ISO string
  endTime: string | null; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoundInput {
  roundNumber: number;
  name: string;
  description?: string;
  startTime?: string | null;
  endTime?: string | null;
}

export interface UpdateRoundInput {
  id: string;
  name?: string;
  description?: string;
  status?: RoundStatus;
  startTime?: string | null;
  endTime?: string | null;
}
