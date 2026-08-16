import { EXERCISES, byId } from "./exercises";
import type {
  Answers,
  Exercise,
  Pattern,
  Program,
  WorkoutDay,
  WorkoutExercise,
} from "./types";

interface Slot {
  pattern: Pattern;
  sets: number;
  reps: string;
  rir: number;
  rest: string;
  prefer?: string[];
  notes?: string;
  main?: boolean;
  core?: boolean;
}

interface DayTemplate {
  id: string;
  focus: string;
  slots: Slot[];
}

const ISO = new Set<Pattern>([
  "chest-iso",
  "lateral",
  "rear-delt",
  "biceps",
  "triceps",
  "quad-iso",
  "hamstring-iso",
  "calf",
  "core",
]);

// ---- Day templates -------------------------------------------------------
const PUSH: DayTemplate = {
  id: "push",
  focus: "Push (Chest / Shoulders / Triceps)",
  slots: [
    { pattern: "horizontal-push", sets: 4, reps: "6-10", rir: 2, rest: "2-3 min", main: true, prefer: ["incline-bb", "incline-smith", "machine-chest-press"], notes: "Your main lift — the one you already track." },
    { pattern: "horizontal-push", sets: 3, reps: "8-12", rir: 1, rest: "90-120s", prefer: ["machine-chest-press", "incline-smith", "flat-smith"], notes: "Machine keeps it safe to push hard solo." },
    { pattern: "chest-iso", sets: 3, reps: "12-15", rir: 1, rest: "60-90s", prefer: ["cable-fly", "pec-deck"], notes: "Squeeze at peak, slow eccentric." },
    { pattern: "vertical-push", sets: 3, reps: "8-12", rir: 2, rest: "90s", prefer: ["seated-db-shoulder", "machine-shoulder"], notes: "Overhead pressing is fine solo." },
    { pattern: "lateral", sets: 3, reps: "12-15", rir: 0, rest: "60s", notes: "Light, strict, no swinging." },
    { pattern: "triceps", sets: 3, reps: "10-15", rir: 1, rest: "60-90s", prefer: ["rope-pushdown", "machine-triceps"], notes: "You're strong here — maintain, don't overbuild." },
    { pattern: "triceps", sets: 3, reps: "12-15", rir: 0, rest: "60s", prefer: ["overhead-cable-ext", "rope-pushdown"], notes: "Stretch-focused, controls elbow strain." },
  ],
};

const PULL: DayTemplate = {
  id: "pull",
  focus: "Pull (Back / Biceps)",
  slots: [
    { pattern: "vertical-pull", sets: 4, reps: "6-10", rir: 2, rest: "2-3 min", main: true, prefer: ["pullups", "lat-wide", "assisted-pullup"], notes: "Add weight once you hit 10 clean reps." },
    { pattern: "horizontal-pull", sets: 3, reps: "8-12", rir: 1, rest: "90-120s", prefer: ["seated-cable-row", "machine-row"], notes: "Chest up, drive elbows back." },
    { pattern: "horizontal-pull", sets: 3, reps: "10-12", rir: 1, rest: "90s", prefer: ["machine-row", "one-arm-db-row", "seated-cable-row"], notes: "Removes lower-back involvement entirely." },
    { pattern: "vertical-pull", sets: 3, reps: "10-12", rir: 1, rest: "90s", prefer: ["lat-wide", "lat-neutral"], notes: "Second back angle." },
    { pattern: "rear-delt", sets: 3, reps: "12-15", rir: 0, rest: "60s", prefer: ["face-pull", "reverse-pec-deck"], notes: "Rear delt + upper back health, keep light." },
    { pattern: "biceps", sets: 3, reps: "8-12", rir: 1, rest: "60-90s", prefer: ["preacher-db", "ez-curl"], notes: "Good baseline — keep it." },
    { pattern: "biceps", sets: 3, reps: "12-15", rir: 0, rest: "60s", prefer: ["cable-curl", "ez-curl"], notes: "Constant-tension finisher." },
  ],
};

const LEGS: DayTemplate = {
  id: "legs",
  focus: "Legs (Quad-Focused, Knee-Conscious)",
  slots: [
    { pattern: "quad", sets: 4, reps: "8-12", rir: 2, rest: "2-3 min", main: true, prefer: ["leg-press", "hack-squat", "smith-squat"], notes: "Feet mid-to-high, don't lock out hard." },
    { pattern: "quad", sets: 3, reps: "8-12", rir: 1, rest: "2 min", prefer: ["hack-squat", "smith-squat", "leg-press"], notes: "Guided bar path — no solo-safety concern." },
    { pattern: "quad-iso", sets: 3, reps: "12-15", rir: 1, rest: "60-90s", prefer: ["leg-extension", "goblet-squat"], notes: "Controlled tempo, no snapping to lockout." },
    { pattern: "hamstring-iso", sets: 3, reps: "10-15", rir: 1, rest: "60-90s", prefer: ["leg-curl-lying", "leg-curl-seated"], notes: "Balances quad work, helps knee stability." },
    { pattern: "calf", sets: 3, reps: "10-15", rir: 1, rest: "60s", prefer: ["calf-standing"], notes: "" },
    { pattern: "calf", sets: 3, reps: "12-15", rir: 0, rest: "60s", prefer: ["calf-seated"], notes: "" },
  ],
};

const UPPER: DayTemplate = {
  id: "upper",
  focus: "Upper (Full Upper Body, Different Angles)",
  slots: [
    { pattern: "horizontal-push", sets: 4, reps: "6-10", rir: 2, rest: "2-3 min", main: true, prefer: ["flat-bb", "flat-smith", "machine-chest-press"], notes: "Different angle from the incline day." },
    { pattern: "vertical-pull", sets: 4, reps: "8-12", rir: 1, rest: "90-120s", prefer: ["lat-neutral", "lat-wide", "pullups"], notes: "" },
    { pattern: "vertical-push", sets: 3, reps: "10-12", rir: 1, rest: "90s", prefer: ["machine-shoulder", "seated-db-shoulder"], notes: "" },
    { pattern: "horizontal-pull", sets: 3, reps: "10-12", rir: 1, rest: "90s", prefer: ["one-arm-db-row", "machine-row", "seated-cable-row"], notes: "Braced — no loose lower back." },
    { pattern: "lateral", sets: 3, reps: "12-15", rir: 0, rest: "60s", prefer: ["lateral-cable", "lateral-db"], notes: "" },
    { pattern: "biceps", sets: 3, reps: "10-12", rir: 1, rest: "60-90s", prefer: ["ez-curl", "preacher-db", "cable-curl"], notes: "" },
    { pattern: "triceps", sets: 3, reps: "10-12", rir: 1, rest: "60-90s", prefer: ["rope-pushdown", "machine-triceps"], notes: "" },
  ],
};

const LOWER: DayTemplate = {
  id: "lower",
  focus: "Lower (Hamstring/Glute) + Core",
  slots: [
    { pattern: "hip", sets: 4, reps: "8-12", rir: 2, rest: "2 min", main: true, prefer: ["hip-thrust", "glute-bridge-machine", "cable-pullthrough"], notes: "Main hip-hinge — no deadlift needed, safer solo." },
    { pattern: "hip", sets: 3, reps: "12-15", rir: 1, rest: "90s", prefer: ["cable-pullthrough", "back-extension"], notes: "Hinge without floor-loading risk." },
    { pattern: "quad", sets: 3, reps: "10-12", rir: 1, rest: "90s", prefer: ["goblet-squat", "leg-press"], notes: "Knee-friendly quad work." },
    { pattern: "hamstring-iso", sets: 3, reps: "10-15", rir: 1, rest: "60-90s", prefer: ["leg-curl-lying", "leg-curl-seated"], notes: "" },
    { pattern: "core", sets: 3, reps: "12-15", rir: 1, rest: "60s", prefer: ["cable-crunch", "ab-machine"], notes: "Core", core: true },
    { pattern: "core", sets: 3, reps: "10-15", rir: 1, rest: "60s", prefer: ["hanging-knee-raise", "plank"], notes: "Core", core: true },
    { pattern: "core", sets: 1, reps: "45-60s hold", rir: 0, rest: "45-60s", prefer: ["plank", "hanging-knee-raise"], notes: "Core", core: true },
  ],
};

const FULL_BODY_A: DayTemplate = {
  id: "full-a",
  focus: "Full Body A",
  slots: [
    { pattern: "horizontal-push", sets: 3, reps: "6-10", rir: 2, rest: "2-3 min", main: true, prefer: ["incline-bb", "flat-bb", "machine-chest-press"], notes: "Main upper push." },
    { pattern: "vertical-pull", sets: 3, reps: "8-12", rir: 2, rest: "2 min", main: true, prefer: ["pullups", "lat-wide"], notes: "Main upper pull." },
    { pattern: "quad", sets: 3, reps: "8-12", rir: 2, rest: "2 min", prefer: ["leg-press", "smith-squat", "goblet-squat"], notes: "Main lower movement." },
    { pattern: "horizontal-pull", sets: 3, reps: "10-12", rir: 1, rest: "90s", prefer: ["machine-row", "seated-cable-row"], notes: "" },
    { pattern: "hip", sets: 3, reps: "10-12", rir: 1, rest: "90s", prefer: ["cable-pullthrough", "hip-thrust", "back-extension"], notes: "" },
    { pattern: "triceps", sets: 2, reps: "10-15", rir: 1, rest: "60s", prefer: ["rope-pushdown"], notes: "" },
    { pattern: "biceps", sets: 2, reps: "10-15", rir: 1, rest: "60s", prefer: ["ez-curl", "cable-curl"], notes: "" },
  ],
};

const FULL_BODY_B: DayTemplate = {
  id: "full-b",
  focus: "Full Body B",
  slots: [
    { pattern: "vertical-push", sets: 3, reps: "8-12", rir: 2, rest: "2 min", main: true, prefer: ["seated-db-shoulder", "machine-shoulder"], notes: "Main upper push (vertical)." },
    { pattern: "horizontal-pull", sets: 3, reps: "8-12", rir: 2, rest: "2 min", main: true, prefer: ["seated-cable-row", "machine-row"], notes: "Main upper pull (horizontal)." },
    { pattern: "quad-iso", sets: 3, reps: "10-15", rir: 1, rest: "90s", prefer: ["leg-extension", "goblet-squat"], notes: "" },
    { pattern: "hamstring-iso", sets: 3, reps: "10-15", rir: 1, rest: "60-90s", prefer: ["leg-curl-lying", "leg-curl-seated"], notes: "" },
    { pattern: "chest-iso", sets: 3, reps: "12-15", rir: 1, rest: "60-90s", prefer: ["cable-fly", "pec-deck"], notes: "" },
    { pattern: "lateral", sets: 3, reps: "12-15", rir: 0, rest: "60s", prefer: ["lateral-cable", "lateral-db"], notes: "" },
    { pattern: "core", sets: 3, reps: "12-15", rir: 1, rest: "60s", prefer: ["cable-crunch", "plank"], notes: "Core", core: true },
  ],
};

// ---- Split selection -------------------------------------------------------
interface Split {
  days: number;
  label: string;
  templateIds: string[];
}

function pickSplit(a: Answers): Split {
  const pref = a.prefersSplit;
  const experienced = Number(a.experienceYears || 0) >= 1 || a.structuredPrograms;
  switch (a.daysPerWeek) {
    case 1:
      return { days: 1, label: "Full Body x1", templateIds: ["full-a"] };
    case 2:
      return { days: 2, label: "Upper / Lower", templateIds: ["upper", "lower"] };
    case 3:
      if (pref === "full-body" || (!pref && !experienced))
        return { days: 3, label: "Full Body A/B/A", templateIds: ["full-a", "full-b", "full-a"] };
      return { days: 3, label: "Push / Pull / Legs", templateIds: ["push", "pull", "legs"] };
    case 4:
      return { days: 4, label: "Upper / Lower / Upper / Lower", templateIds: ["upper", "lower", "upper", "lower"] };
    case 5:
      return { days: 5, label: "Push / Pull / Legs / Upper / Lower", templateIds: ["push", "pull", "legs", "upper", "lower"] };
    case 6:
      return { days: 6, label: "Push / Pull / Legs x2", templateIds: ["push", "pull", "legs", "push", "pull", "legs"] };
    default:
      return { days: 7, label: "Push / Pull / Legs / Upper / Lower / Push / Pull", templateIds: ["push", "pull", "legs", "upper", "lower", "push", "pull"] };
  }
}

const DEFAULT_DAYS: Record<number, string[]> = {
  1: ["Monday"],
  2: ["Monday", "Thursday"],
  3: ["Monday", "Wednesday", "Friday"],
  4: ["Monday", "Tuesday", "Thursday", "Friday"],
  5: ["Monday", "Tuesday", "Wednesday", "Saturday", "Sunday"],
  6: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday", "Sunday"],
  7: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};

// ---- Exercise picking -------------------------------------------------------
function available(e: Exercise, a: Answers): boolean {
  return e.equipment.every((eq) => a.equipment.includes(eq));
}

function banned(e: Exercise, a: Answers): boolean {
  const name = e.name.toLowerCase();
  if (a.cannotDo.some((c) => name.includes(c.toLowerCase()) || e.id === c)) return true;
  if (e.risk && e.risk.some((r) => a.injuries.includes(r))) return true;
  return false;
}

function score(e: Exercise, a: Answers): number {
  let s = 0;
  if (a.equipmentPref === "machines" && e.equipment.some((q) => q === "machine" || q === "smith" || q === "leg-press")) s += 3;
  if (a.equipmentPref === "free-weights" && e.equipment.some((q) => q === "barbell" || q === "dumbbell")) s += 3;
  if (a.equipmentPref === "combination") s += 1;
  if (e.soloSafe) s += 2;
  return s;
}

function pickFor(slot: Slot, a: Answers, used: Set<string>): Exercise {
  const candidates = EXERCISES.filter((e) => e.pattern === slot.pattern && !banned(e, a));
  for (const prefId of slot.prefer ?? []) {
    const e = byId(prefId);
    if (e && available(e, a) && !banned(e, a) && !used.has(e.id)) return e;
  }
  const sorted = candidates
    .filter((e) => available(e, a) && !used.has(e.id))
    .sort((x, y) => score(y, a) - score(x, a));
  const soloSafePick = sorted.find((e) => e.soloSafe) ?? sorted[0];
  if (!soloSafePick) {
    // last resort: an unavailable but un-banned candidate (notes flag missing equipment)
    return candidates.find((e) => !used.has(e.id)) ?? candidates[0];
  }
  return soloSafePick;
}

// ---- Builder --------------------------------------------------------------
const SOLO_UNSAFE = new Set(["db-chest-press"]);

function buildDay(template: DayTemplate, a: Answers): WorkoutDay {
  const used = new Set<string>();
  const exercises: WorkoutExercise[] = [];
  for (const slot of template.slots) {
    if (slot.core && !a.includeCore) continue;
    const e = pickFor(slot, a, used);
    used.add(e.id);
    const compound = !ISO.has(slot.pattern);
    const rir = slot.rir + (a.avoidNearFailure && compound ? 1 : 0);
    let notes = slot.notes ?? e.notes ?? "";
    if (SOLO_UNSAFE.has(e.id)) notes = (notes ? notes + " " : "") + "Needs a spotter — swap if alone.";
    exercises.push({
      id: e.id,
      name: e.name,
      sets: slot.sets,
      reps: slot.reps,
      rir,
      rest: slot.rest,
      notes,
    });
  }
  return { id: template.id, focus: template.focus, durationMin: estimateMinutes(exercises), exercises };
}

function restMinutes(rest: string): number {
  const num = parseFloat(rest) || 1.5;
  return rest.includes("s") ? num / 60 : num;
}

function estimateMinutes(es: WorkoutExercise[]): number {
  return Math.round(
    es.reduce((sum, e) => {
      const restMin = restMinutes(e.rest);
      return sum + e.sets * (restMin + 0.75) + 5;
    }, 0) + 8
  );
}

function trimToSession(ex: WorkoutExercise[], capMin: number): WorkoutExercise[] {
  while (ex.length > 3 && estimateMinutes(ex) > capMin) ex.pop();
  return ex;
}

function weeklyVolume(workouts: WorkoutDay[]): Program["weeklyVolume"] {
  const counts: Record<string, number> = {};
  for (const day of workouts)
    for (const e of day.exercises) {
      const ex = byId(e.id);
      if (!ex) continue;
      counts[ex.muscles[0]] = (counts[ex.muscles[0]] ?? 0) + e.sets;
    }
  const label: Record<string, string> = {
    chest: "Chest",
    back: "Back",
    lats: "Lats",
    shoulders: "Shoulders (lateral/rear)",
    triceps: "Triceps",
    biceps: "Biceps",
    quads: "Quads",
    hamstrings: "Hamstrings",
    glutes: "Glutes",
    calves: "Calves",
    core: "Abs/core",
  };
  const order = ["chest", "back", "lats", "shoulders", "triceps", "biceps", "quads", "hamstrings", "glutes", "calves", "core"];
  return order
    .filter((m) => counts[m])
    .map((m) => ({
      muscle: label[m] ?? m,
      sets: Math.round(counts[m]),
      reason: volumeReason(m),
    }));
}

function volumeReason(muscle: string): string {
  const tips: Record<string, string> = {
    chest: "Recovers fast, hits twice a week via Push + Upper.",
    back: "Back tolerates slightly more volume; you're already decent at pulling.",
    lats: "Drives width; trained on Pull + Upper days.",
    shoulders: "Small muscle, recovers fast — pressing already covers the front.",
    triceps: "Already a strong point — maintaining, not overbuilding.",
    biceps: "Same logic — a strong point you're maintaining.",
    quads: "Knee-conscious dosing — moderate, controlled, not maxed.",
    hamstrings: "Balances quad-dominant lifting and protects knees long-term.",
    glutes: "Builds the athletic look; hip-hinge work carries it.",
    calves: "2x/week is the minimum effective dose.",
    core: "Diet drives visible abs; this keeps the core strong.",
  };
  return tips[muscle] ?? "";
}

function buildRationale(a: Answers, split: Split): string {
  const experienced = Number(a.experienceYears || 0) >= 1 || a.structuredPrograms;
  const parts: string[] = [];
  parts.push(
    experienced
      ? `You've been training long enough that junk volume and random bro-split days will slow you down. You need real progressive overload, controlled fatigue, and enough volume to grow — not more.`
      : `You're early enough in training that consistency and technique will carry you further than clever programming. Keep it simple, add a little weight or a rep most sessions, and don't chase fatigue.`
  );
  parts.push(
    `Your schedule splits cleanly into ${split.label}. Every major muscle group gets trained twice a week (the hypertrophy sweet spot) and your rest days land where recovery matters most.`
  );
  if (a.dieting || a.goal === "fat-loss" || a.goal === "recomp")
    parts.push(`You're training while eating at a deficit — recovery capacity is lower than when bulking, so this program is deliberately moderate volume. More sets ≠ more growth here.`);
  if (a.injuries.includes("knees"))
    parts.push(`Knee-loading movements are dosed moderately and biased toward machines and guided bar paths (leg press, smith/hack squat) rather than heavy free-weight squatting. If a specific movement bothers your knees, use the substitutions instead of pushing through.`);
  if (a.injuries.length === 0 && a.equipment.includes("barbell"))
    parts.push(`No conventional deadlifts or barbell RDLs — hip thrusts and cable pull-throughs give the same hamstring/glute stimulus with far less risk training solo.`);
  return parts.join(" ");
}

function buildProgression(): string[] {
  const x: string[] = [];
  x.push("Use double progression on every exercise:");
  x.push("1. Start at a weight where you can hit the BOTTOM of each rep range with the prescribed RIR.");
  x.push("2. Each session, try to add 1 rep to at least one set versus last time, staying at or above the target RIR.");
  x.push("3. Once you hit the TOP of the rep range on every working set, add weight next session:");
  x.push("   - Upper compounds (bench, press, row, pulldown): +2.5kg");
  x.push("   - Upper isolation (curls, lateral raise, pushdown): +1-2kg");
  x.push("   - Lower compounds (leg press, hack squat, hip thrust): +5-10kg");
  x.push("   - Lower isolation (leg curl, extension, calves): +2.5-5kg");
  x.push("4. After a weight jump your reps will drop toward the bottom of the range — expected. Build back up, then jump again.");
  x.push("5. If you miss the rep target at the bottom of the range even at target RIR, repeat the same weight next session. One bad day usually means fatigue, sleep, or nutrition — not regression.");
  x.push("6. RIR over time: early sets stay at RIR 2. As you approach a deload (week 5-6), let your LAST compound set drift to RIR 0-1 to fully express fatigue. Isolations can run closer to failure more often — injury risk is lower.");
  x.push("7. Write down weight x reps for every set, every session. The log is the only thing that tells you if you're progressing — memory lies, the log doesn't.");
  return x;
}

function buildDeload(): Program["deload"] {
  return {
    when: "Every 6-7 weeks, or earlier if you notice 2+ of: reps stalling across multiple lifts, joints (especially knees) feeling achy rather than just worked, motivation/sleep tanking, or grinding through sessions.",
    how: [
      "Cut sets per exercise by ~40% (e.g. 4 sets → 2-3).",
      "Drop weight by ~10-20% on everything.",
      "Keep RIR high (3-4) — no chasing a pump or pushing intensity.",
      "Keep the same schedule — same days, just lighter.",
      "Return the following week at pre-deload weights — you'll often hit new numbers within 1-2 sessions.",
    ],
  };
}

function buildWarmup(): string[] {
  return [
    "5 minutes light cardio (bike or incline walk) to raise core temp.",
    "FIRST compound of the day only: 2-3 ramp-up sets — bar/light x8, ~50% of working weight x5, ~75% x3, then straight into working sets.",
    "Every other exercise: one light warm-up set if a joint feels stiff, otherwise straight into working sets.",
    "Keep the whole warm-up under 10 minutes.",
  ];
}

function buildCardio(a: Answers): string[] {
  const x: string[] = [];
  if (!a.includeCardio) {
    x.push("No cardio prescribed — focus recovery on lifting and daily steps.");
    x.push(`Keep walking toward 9-10k steps/day (currently ~${a.dailySteps || "7-8k"}).`);
    return x;
  }
  const freq = a.goal === "fat-loss" ? 3 : 2;
  x.push(`${freq} sessions/week on rest days.`);
  x.push("25-30 minutes steady state, moderate intensity (conversation-possible but not easy).");
  x.push("Incline treadmill walk or stationary bike — avoid running/jogging, it's higher impact on the knees.");
  x.push(`Push daily steps toward 9-10k (currently ~${a.dailySteps || "7-8k"}) — this often moves the needle more than gym cardio and costs nothing in recovery.`);
  if (a.goal === "fat-loss")
    x.push("If fat loss stalls after a few weeks, add a short 15-20 min cardio session after weights on a lifting day.");
  return x;
}

function buildSubstitutions(workouts: WorkoutDay[], a: Answers): Program["substitutions"] {
  const out: Program["substitutions"] = [];
  const seen = new Set<string>();
  for (const day of workouts)
    for (const e of day.exercises) {
      const ex = byId(e.id);
      if (!ex || seen.has(e.id)) continue;
      seen.add(e.id);
      const alt = ex.sub
        ?.map(byId)
        .find((s) => s && available(s, a) && !banned(s, a) && s.id !== e.id);
      if (alt) out.push({ from: ex.name, to: alt.name });
    }
  if (a.injuries.includes("knees")) {
    out.push({ from: "Leg Extension (if knees complain)", to: "Drop it, add one extra set of leg press instead" });
    out.push({ from: "Squat/hack squat (if knees complain)", to: "Leg press with feet higher on the platform" });
  }
  return out;
}

function build12Week(): Program["twelveWeek"] {
  return [
    { weeks: "1-2", focus: "Establish baseline weights on every lift at the prescribed RIR. Don't chase big jumps yet — lock in movement patterns and the logging habit." },
    { weeks: "3-5", focus: "Standard progression block — double progression on every lift; weight goes up as rep targets are met." },
    { weeks: "6", focus: "Deload week — reduced volume and intensity as described above." },
    { weeks: "7-9", focus: "Second progression block — you should be moving noticeably more weight than weeks 1-2." },
    { weeks: "10-11", focus: "Keep progressing; push last-set RIR down toward 0-1 on compounds as fatigue builds." },
    { weeks: "12", focus: "Deload, then reassess: progress photos, waist measurement, and strength numbers vs week 1. Decide whether to keep the deficit, adjust calories, or shift toward a lean bulk." },
  ];
}

export function buildProgram(a: Answers): Program {
  const split = pickSplit(a);
  const byIdMap: Record<string, DayTemplate> = { push: PUSH, pull: PULL, legs: LEGS, upper: UPPER, lower: LOWER, "full-a": FULL_BODY_A, "full-b": FULL_BODY_B };
  const scheduleDays = (a.preferredDays.length === a.daysPerWeek ? a.preferredDays : DEFAULT_DAYS[a.daysPerWeek] ?? DEFAULT_DAYS[5]) as string[];

  let workouts = split.templateIds.map((id) => buildDay(byIdMap[id], a));
  workouts = workouts.map((w) => ({ ...w, exercises: trimToSession(w.exercises, a.sessionMin) }));

  // priority muscles: +1 set on first slot that targets them
  const workoutsAfter = workouts.map((w) => {
    const boosted = new Set<string>();
    const exercises = w.exercises.map((e) => {
      const ex = byId(e.id);
      if (!ex) return e;
      const hit = ex.muscles.find((m) => a.priorityMuscles.includes(m) && !boosted.has(m));
      if (hit && boosted.size < 2) {
        boosted.add(hit);
        return { ...e, sets: e.sets + 1, notes: (e.notes ? e.notes + " " : "") + "Priority muscle — +1 set." };
      }
      return e;
    });
    return { ...w, exercises };
  });

  const weeklySchedule = scheduleDays.map((day, i) => ({
    day,
    focus: workouts[i % workouts.length].focus,
    durationMin: workouts[i % workouts.length].durationMin,
  }));

  return {
    title: `${split.label} — Recomp Program`,
    rationale: buildRationale(a, split),
    weeklySchedule,
    workouts: workoutsAfter,
    weeklyVolume: weeklyVolume(workoutsAfter),
    progression: buildProgression(),
    deload: buildDeload(),
    warmup: buildWarmup(),
    cardio: buildCardio(a),
    core: a.includeCore
      ? "Direct ab work is built into the Lower day (cable crunch, knee raises, plank). It builds thickness and shape, but visible abs come overwhelmingly from body fat — consistency with your nutrition does more than extra crunches."
      : "No dedicated core work — skipped by your preference. Optional: 2 sets of plank or hanging knee raises at the end of Lower day.",
    substitutions: buildSubstitutions(workoutsAfter, a),
    twelveWeek: build12Week(),
  };
}