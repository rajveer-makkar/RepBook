import { buildProgram, resolveExperienceLevel, resolveRecoveryLevel, suggestReplacements } from "../lib/engine";
import { byId } from "../lib/exercises";
import { summarizeFeedback } from "../lib/adaptive";
import { computeNutrition, preferredTarget } from "../lib/nutrition";
import type { Answers } from "../lib/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok:", msg);
}

const a: Answers = {
  age: "19", sex: "male", heightCm: "179", weightKg: "93", bodyFatPct: "24",
  goal: "recomp", priority: "appearance",
  daysPerWeek: 5, sessionMin: 90,
  preferredDays: ["Monday","Tuesday","Wednesday","Saturday","Sunday"],
  preferredDaysFixed: true,
  needRestSpacing: true,
  experienceYears: "1", structuredPrograms: false,
  benchKg: "80", pullups: "8", squatKg: "", deadliftKg: "",
  equipment: ["barbell","dumbbell","cable","machine","squat-rack","smith","pullup-bar","leg-press"],
  equipmentPref: "combination",
  cannotDo: ["deadlift","rdl","dumbbell chest press"],
  priorityMuscles: ["chest","biceps"],
  avoidNearFailure: false,
  intensityPref: "moderate",
  injuries: ["knees"],
  prefersSplit: "auto",
  dailySteps: "7-8k", sleepHours: "6", sports: "", dieting: true,
  includeCardio: true, includeCore: true,
};

const p = buildProgram(a);

assert(resolveExperienceLevel(a) === "intermediate", "experience level maps from years");
assert(resolveRecoveryLevel(a) === "medium", "recovery level maps from sleep/steps");
assert(p.weeklySchedule.length === 5, "schedule matches daysPerWeek");
assert(p.workouts.every((w) => w.exercises.length > 0), "every day has exercises");
assert(p.workouts.every((w) => w.durationMin <= 90), "session duration respects cap");
assert(!p.workouts.flatMap((w) => w.exercises).some((e) => /deadlift|rdl/i.test(e.name)), "banned exercises absent");
assert(p.weeklyVolume.every((v) => v.sets > 0), "volume rows non-zero");

// recovery low should shave volume off
const lowRec = buildProgram({ ...a, recoveryLevel: "low" });
const medRec = buildProgram({ ...a, recoveryLevel: "medium" });
const totalSets = (p: ReturnType<typeof buildProgram>) =>
  p.workouts.flatMap((w) => w.exercises).reduce((s, e) => s + e.sets, 0);
assert(totalSets(lowRec) < totalSets(medRec), "low recovery trims total volume");

// beginner caps compounds
const beg = buildProgram({ ...a, experienceLevel: "beginner", recoveryLevel: "medium" });
const compoundSets = beg.workouts.flatMap((w) => w.exercises).map((e) => e.sets);
assert(Math.max(...compoundSets) <= 4, "beginner compound sets capped");

// intensity pref shifts RIR
const hard = buildProgram({ ...a, intensityPref: "hard" });
assert(hard.workouts.flatMap((w) => w.exercises).some((e) => e.rir < p.workouts.flatMap((w) => w.exercises).find((x) => x.id === e.id)!.rir), "hard intensity lowers RIR");

// swaps: remove + replace a chest exercise
const swapProg = buildProgram({ ...a, swaps: [{ from: "incline-bb", to: "machine-chest-press", reason: "equipment" }] });
assert(!swapProg.workouts.flatMap((w) => w.exercises).some((e) => e.id === "incline-bb"), "swapped exercise removed");
assert(swapProg.workouts.flatMap((w) => w.exercises).some((e) => e.id === "machine-chest-press"), "replacement present");

// swaps: bare removal
const removeProg = buildProgram({ ...a, swaps: [{ from: "incline-bb", to: "", reason: "dislike" }] });
assert(!removeProg.workouts.flatMap((w) => w.exercises).some((e) => e.id === "incline-bb"), "exercise removable without replacement");

// replacements suggestions target the same muscle group
const reps = suggestReplacements("incline-bb", "injury", a);
assert(reps.length > 0, "replacement suggestions returned");
assert(reps.every((r) => r.id !== "incline-bb"), "suggestions exclude the removed exercise");

// ---- adaptive: feedback summary -------------------------------------------
const fb = summarizeFeedback([
  { difficulty: "hard", performance: "same", pain: [] },
  { difficulty: "brutal", performance: "worse", pain: [] },
  { difficulty: "brutal", performance: "worse", pain: ["knees"] },
]);
assert(fb.avgDifficulty >= 2, "feedback avg difficulty picks up hard sessions");
assert(fb.brutalStreak === 2, "brutal streak counts trailing brutal sessions");
assert(fb.pain.has("knees"), "feedback pain areas collected");

const adapted = buildProgram(a, fb);
const baseline = buildProgram(a);
const adaptedSets = (p: ReturnType<typeof buildProgram>) =>
  p.workouts.flatMap((w) => w.exercises).reduce((s, e) => s + e.sets, 0);
assert(adaptedSets(adapted) <= adaptedSets(baseline), "hard feedback does not add volume");
assert(adapted.deload.when.startsWith("Every 4"), "brutal streak pulls deload earlier");
assert(
  !adapted.workouts.flatMap((w) => w.exercises).some((e) => {
    const ex = byId(e.id);
    return ex?.risk?.includes("knees");
  }),
  "pain areas auto-swap at-risk exercises"
);

// ---- nutrition -------------------------------------------------------------
const plan = computeNutrition(a);
assert(plan.maintenance.calories > 1500 && plan.maintenance.calories < 4000, "maintenance calories in sane range");
assert(plan.moderateCut.calories < plan.maintenance.calories, "cut below maintenance");
assert(plan.aggressiveCut.calories < plan.moderateCut.calories, "aggressive cut below moderate cut");
assert(plan.leanBulk.calories > plan.maintenance.calories, "bulk above maintenance");
assert(plan.maintenance.proteinG >= 120, "protein grams are meaningful");
assert(preferredTarget(a) === "maintenance", "goal maps to preferred target");

console.log("\nTITLE:", p.title);
console.log("\nWORKOUTS:");
p.workouts.forEach((d) => {
  console.log(`\n[${d.focus}] ~${d.durationMin}min`);
  d.exercises.forEach((e) => console.log(`  ${e.name} | ${e.sets}x${e.reps} | RIR ${e.rir} | ${e.rest} | ${e.notes ?? ""}`));
});
console.log("\nWARNINGS:", p.warnings.length ? p.warnings : "none");
