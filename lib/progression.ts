export interface SetLog {
  weight_kg: number | null;
  reps: number | null;
  rir_felt: number | null;
}

export interface ProgressionExercise {
  name: string;
  repsMin: number | null;
  repsMax: number | null;
  lastLogs: SetLog[];
}

export type ProgressionAction = "up" | "hold" | "down";

export interface Suggestion {
  action: ProgressionAction;
  weight: number | null;
  reason: string;
}

const INCREMENT = 2.5;
const round1 = (w: number) => Math.round(w * 2) / 2;

export function suggestProgression(ex: ProgressionExercise): Suggestion | null {
  if (!ex.repsMin || !ex.repsMax || ex.lastLogs.length === 0) return null;

  const top = [...ex.lastLogs].sort(
    (a, b) => (b.weight_kg ?? 0) - (a.weight_kg ?? 0) || (b.reps ?? 0) - (a.reps ?? 0)
  )[0];

  if (!top.weight_kg || !top.reps) return null;

  const rirLogs = ex.lastLogs.filter((l) => l.rir_felt != null);
  const avgRir = rirLogs.length
    ? rirLogs.reduce((s, l) => s + (l.rir_felt ?? 0), 0) / rirLogs.length
    : null;

  if (top.reps >= ex.repsMax) {
    const next = round1(top.weight_kg + INCREMENT);
    return {
      action: "up",
      weight: next,
      reason: avgRir != null && avgRir <= 1
        ? `Hit ${top.reps} reps (RIR ${round1(avgRir)}) at the top of the range — go ${next} kg next time.`
        : `Hit ${top.reps} reps at the top of the range — go ${next} kg next time.`,
    };
  }

  if (top.reps < ex.repsMin) {
    const next = round1(Math.max(0, top.weight_kg - INCREMENT));
    return {
      action: "down",
      weight: next,
      reason: `Only ${top.reps} reps — below the ${ex.repsMin} target. Drop to ${next} kg.`,
    };
  }

  return {
    action: "hold",
    weight: top.weight_kg,
    reason: `Hit ${top.reps} reps in range. Add a rep or two before increasing the weight.`,
  };
}

export function suggestForWorkout(
  exercises: { id: string; name: string; repsMin: number | null; repsMax: number | null }[],
  logsByExercise: Record<string, SetLog[]>
): Record<string, Suggestion | null> {
  const out: Record<string, Suggestion | null> = {};
  for (const ex of exercises) {
    out[ex.id] = suggestProgression({
      name: ex.name,
      repsMin: ex.repsMin,
      repsMax: ex.repsMax,
      lastLogs: logsByExercise[ex.id] ?? [],
    });
  }
  return out;
}