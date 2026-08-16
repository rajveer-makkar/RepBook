import { buildProgram, resolveExperienceLevel, resolveRecoveryLevel, suggestReplacements } from "../lib/engine";
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

console.log("\nTITLE:", p.title);
console.log("\nWORKOUTS:");
p.workouts.forEach((d) => {
  console.log(`\n[${d.focus}] ~${d.durationMin}min`);
  d.exercises.forEach((e) => console.log(`  ${e.name} | ${e.sets}x${e.reps} | RIR ${e.rir} | ${e.rest} | ${e.notes ?? ""}`));
});
console.log("\nWARNINGS:", p.warnings.length ? p.warnings : "none");
