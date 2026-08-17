const KEY = "repbook-pending";

import type { SessionFeedback } from "@/lib/types";

export interface QueuedCompletion {
  sessionId: string;
  logs: Array<{
    exercise_template_id: string | null;
    exercise_name: string;
    set_number: number;
    weight_kg: number | null;
    reps: number | null;
    rir_felt: number | null;
    is_completed: boolean;
  }>;
  feedback?: SessionFeedback;
}

// ponytail: localStorage queue, flushed on "online" event. iOS has no Background
// Sync, so this only works for sessions already started online. Upgrade path:
// IndexedDB + background-sync registration if queue grows / Android needs it.
export function getPending(): QueuedCompletion[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function enqueuePending(item: QueuedCompletion): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...getPending(), item]));
  } catch {
    /* storage full */
  }
}

export function removePending(sessionId: string): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(getPending().filter((p) => p.sessionId !== sessionId))
    );
  } catch {
    /* ignore */
  }
}