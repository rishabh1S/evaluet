import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../env";
import { authFetch } from "../auth";

export type StatsData = {
  score_avg: number;
  score_delta_pct: number;
  practice_total_hours: number;
  practice_month_hours: number;
};

async function fetchStats(): Promise<StatsData> {
  const res = await authFetch(`${API_BASE}/api/interview/stats`);
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export function useStats() {
  return useQuery({
    queryKey: ["interview-stats"],
    queryFn: fetchStats,
    staleTime: 2 * 60 * 1000,
  });
}
