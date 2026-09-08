import { useState, useEffect } from "react";

export function useTeam() {
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Placeholder hook returning mock team data or reading from local state
    setTeam({ id: "team-1", name: "Alpha" });
  }, []);

  return { team };
}