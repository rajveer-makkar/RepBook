import type { SupabaseClient } from "@supabase/supabase-js";
import type { SessionDifficulty, SessionFeedback } from "@/lib/types";

export interface FeedbackSummary {
  count: number;
  avgDifficulty: number; // 0 easy … 3 brutal
  avgPerformance: number; // 1 better, 0 same, -1 worse (reported sessions only)
  pain: Set<string>;
  brutalStreak: number;
}

// Serialized form — pain as string[] so it can cross the server/client boundary.
export type FeedbackProp = Omit<FeedbackSummary, "pain"> & { pain: string[] };

export function toProp(fb: FeedbackSummary): FeedbackProp {
  return { ...fb, pain: [...fb.pain] };
}

export function toSummary(fb: FeedbackProp): FeedbackSummary {
  return { ...fb, pain: new Set(fb.pain) };
}

const DIFF_SCORE: Record<SessionDifficulty, number> = { easy: 0, good: 1, hard: 2, brutal: 3 };
const PERF_SCORE = { better: 1, same: 0, worse: -1 } as const;

export function summarizeFeedback(sessions: Pick<SessionFeedback, "difficulty" | "performance" | "pain">[]): FeedbackSummary {
  const withDiff = sessions.filter((s) => s.difficulty);
  const withPerf = sessions.filter((s) => s.performance);
  const pain = new Set<string>();
  for (const s of sessions) for (const p of s.pain ?? []) pain.add(p);

  let streak = 0;
  for (let i = sessions.length - 1; i >= 0 && sessions[i].difficulty === "brutal"; i--) streak++;

  return {
    count: sessions.length,
    avgDifficulty: withDiff.length
      ? withDiff.reduce((sum, s) => sum + DIFF_SCORE[s.difficulty as SessionDifficulty], 0) / withDiff.length
      : 1,
    avgPerformance: withPerf.length
      ? withPerf.reduce((sum, s) => sum + PERF_SCORE[s.performance as keyof typeof PERF_SCORE], 0) / withPerf.length
      : 0,
    pain,
    brutalStreak: streak,
  };
}

// Fetch last 5 completed sessions with feedback. Safe to call from server components.
// supabase: the browser/server Supabase client — typed loosely to avoid an engine↔supabase import cycle.
export async function fetchFeedbackSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<FeedbackSummary | null> {
  const { data } = await supabase
    .from("sessions")
    .select("difficulty, performance, pain")
    .eq("user_id", userId)
    .eq("status", "completed")
    .not("difficulty", "is", null)
    .order("started_at", { ascending: false })
    .limit(5);
  if (!data?.length) return null;
  return summarizeFeedback(data);
}
