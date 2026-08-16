"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Notification01Icon, ArrowUp01Icon, ArrowDown01Icon } from "hugeicons-react";
import { completeSession } from "@/lib/actions/sessions";
import type { Suggestion } from "@/lib/progression";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export interface LoggerExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rir: number;
  restSec: number;
  notes?: string | null;
}

interface Props {
  sessionId: string;
  focus: string;
  exercises: LoggerExercise[];
  suggestions?: Record<string, Suggestion | null>;
}

interface SetEntry {
  set_number: number;
  weight: string;
  reps: string;
  rir: string;
  done: boolean;
}

interface RestState {
  active: boolean;
  endsAt: number;
  total: number;
}

const STORAGE_PREFIX = "repbook-draft-";

function emptyEntries(exercises: LoggerExercise[]): SetEntry[][] {
  return exercises.map((e) =>
    Array.from({ length: e.sets }, (_, i) => ({
      set_number: i + 1,
      weight: "",
      reps: "",
      rir: "",
      done: false,
    }))
  );
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function WorkoutLogger({ sessionId, focus, exercises, suggestions = {} }: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState<SetEntry[][]>(() => emptyEntries(exercises));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState<RestState>({ active: false, endsAt: 0, total: 0 });
  const [restLeft, setRestLeft] = useState(0);

  useEffect(() => {
    const draft = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(draft);
  }, []);

  useEffect(() => {
    if (!rest.active) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((rest.endsAt - Date.now()) / 1000));
      setRestLeft(left);
      if (left <= 0) {
        clearInterval(id);
        setRest({ active: false, endsAt: 0, total: 0 });
        try {
          new Notification("Rest over — next set", { body: focus });
        } catch {
          /* notifications unsupported */
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [rest, focus]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + sessionId);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === exercises.length)
          // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time draft hydration from localStorage
          setEntries(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [sessionId, exercises]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + sessionId, JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }, [entries, sessionId]);

  const setCell = (ex: number, set: number, patch: Partial<SetEntry>) => {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === ex ? e.map((s, j) => (j === set ? { ...s, ...patch } : s)) : e
      )
    );
  };

  const startRest = (sec: number) => {
    setRest({ active: true, endsAt: Date.now() + sec * 1000, total: sec });
    setRestLeft(sec);
  };

  const toggleSet = (ex: number, set: number) => {
    const wasDone = entries[ex][set].done;
    setCell(ex, set, { done: !wasDone });
    if (!wasDone && ex >= 0 && exercises[ex].restSec > 0 && Notification.permission === "granted")
      startRest(exercises[ex].restSec);
  };

  const askNotify = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const finish = async () => {
    setSaving(true);
    setError(undefined);
    const logs = entries.flatMap((exerciseLog, ex) =>
      exerciseLog
        .filter((s) => s.done)
        .map((s) => ({
          exercise_template_id: exercises[ex].id,
          exercise_name: exercises[ex].name,
          set_number: s.set_number,
          weight_kg: s.weight ? Number(s.weight) : null,
          reps: s.reps ? Number(s.reps) : null,
          rir_felt: s.rir !== "" ? Number(s.rir) : null,
          is_completed: true,
        }))
    );
    const res = await completeSession(sessionId, logs);
    if (res?.error) {
      setError(res.error);
      setSaving(false);
      return;
    }
    try {
      localStorage.removeItem(STORAGE_PREFIX + sessionId);
    } catch {
      /* ignore */
    }
    router.refresh();
  };

  const totalLogged = entries.flat().filter((s) => s.done).length;
  const totalSets = entries.flat().length;
  const firstUndone = (() => {
    for (let i = 0; i < entries.length; i++)
      for (let j = 0; j < entries[i].length; j++)
        if (!entries[i][j].done) return { ex: i, set: j };
    return null;
  })();

  const inputCls =
    "w-16 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-center text-sm text-zinc-900 outline-none focus:border-zinc-500";

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{focus}</h1>
          <p className="text-sm text-zinc-500">
            {formatTime(elapsed)} · {totalLogged}/{totalSets} sets logged
          </p>
        </div>
        <button
          onClick={askNotify}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600"
        >
          <Notification01Icon size={15} />
          Rest alerts
        </button>
      </div>

      {firstUndone && (
        <button
          onClick={() => {
            const { ex, set } = firstUndone;
            document.getElementById(`ex-${ex}-set-${set}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700"
        >
          Jump to next set → {exercises[firstUndone.ex].name}
        </button>
      )}

      <div className="space-y-3">
        {exercises.map((ex, exIdx) => {
          const s = suggestions[ex.id];
          return (
          <div key={ex.id} id={`ex-${exIdx}`} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="font-semibold text-zinc-900">{ex.name}</p>
              <p className="text-xs text-zinc-500">
                {ex.sets}×{ex.reps} · RIR {ex.rir} · rest {Math.round(ex.restSec / 60)}m
              </p>
            </div>
            {s && (
              <div
                className={cn(
                  "mb-3 flex items-start gap-1.5 rounded-lg px-3 py-2 text-xs",
                  s.action === "up" && "bg-emerald-50 text-emerald-700",
                  s.action === "hold" && "bg-zinc-50 text-zinc-600",
                  s.action === "down" && "bg-amber-50 text-amber-700"
                )}
              >
                {s.action === "up" && <ArrowUp01Icon size={14} className="mt-0.5 shrink-0" />}
                {s.action === "down" && <ArrowDown01Icon size={14} className="mt-0.5 shrink-0" />}
                <span>{s.reason}</span>
              </div>
            )}
            <div className="space-y-2">
              {entries[exIdx].map((set, setIdx) => (
                <div
                  key={setIdx}
                  id={`ex-${exIdx}-set-${setIdx}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2",
                    set.done ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"
                  )}
                >
                  <span className="w-5 text-center text-xs font-medium text-zinc-400">{set.set_number}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="kg"
                    value={set.weight}
                    onChange={(e) => setCell(exIdx, setIdx, { weight: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="reps"
                    value={set.reps}
                    onChange={(e) => setCell(exIdx, setIdx, { reps: e.target.value })}
                    className={inputCls}
                  />
                  <select
                    value={set.rir}
                    onChange={(e) => setCell(exIdx, setIdx, { rir: e.target.value })}
                    className="w-14 rounded-lg border border-zinc-300 bg-white px-1 py-1.5 text-center text-sm text-zinc-700 outline-none"
                  >
                    <option value="">RIR</option>
                    {[0, 1, 2, 3, 4].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => toggleSet(exIdx, setIdx)}
                    className={cn(
                      "ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold",
                      set.done
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-300 text-zinc-600 hover:border-zinc-900"
                    )}
                  >
                    {set.done ? "✓ Done" : "Log"}
                  </button>
                </div>
              ))}
            </div>
            {ex.notes && <p className="mt-2 text-xs text-zinc-400">{ex.notes}</p>}
          </div>
          );
        })}
      </div>

      {rest.active && (
        <div className="fixed inset-x-0 bottom-20 z-20 mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between rounded-xl bg-zinc-900 px-5 py-4 text-white shadow-lg">
            <div>
              <p className="text-xs text-zinc-400">Rest · {Math.round(rest.total / 60)}m</p>
              <p className="text-2xl font-bold tabular-nums">{formatTime(restLeft)}</p>
            </div>
            <button
              onClick={() => setRest({ active: false, endsAt: 0, total: 0 })}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={finish} loading={saving} className="sticky bottom-16">
        Finish workout
      </Button>
    </div>
  );
}