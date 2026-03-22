import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../env";
import { authFetch } from "../auth";

export type InterviewHistoryItem = {
  session_id: string;
  job_role: string;
  candidate_level: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED";
  created_at: string | null;
  interviewer_name: string | null;
  interviewer_image: string | null;
};

async function fetchHistory(): Promise<InterviewHistoryItem[]> {
  const res = await authFetch(`${API_BASE}/api/interview/history`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export function useInterviewHistory() {
  return useQuery({
    queryKey: ["interview-history"],
    queryFn: fetchHistory,
  });
}
