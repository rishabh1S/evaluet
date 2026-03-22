import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../env";
import { authFetch } from "../auth";

export type SkillScores = {
  technical_knowledge: number;
  communication: number;
  problem_solving: number;
  confidence: number;
};

export type TranscriptMessage = {
  role: "ai" | "user";
  text: string;
};

export type ReportData = {
  session_id: string;
  score: number;
  skill_scores: SkillScores;
  strengths: string[];
  improvements: string[];
  hiring_decision: string;
  final_verdict: string;
  job_role: string;
  candidate_level: string;
  created_at: string | null;
  interviewer_name: string | null;
  transcript: TranscriptMessage[];
  has_pdf: boolean;
};

async function fetchReport(sessionId: string): Promise<ReportData> {
  const res = await authFetch(`${API_BASE}/api/interview/report/${sessionId}`);
  if (!res.ok) throw new Error("Failed to load report");
  return res.json();
}

export function useReport(sessionId: string) {
  return useQuery({
    queryKey: ["interview-report", sessionId],
    queryFn: () => fetchReport(sessionId),
    enabled: !!sessionId,
  });
}
