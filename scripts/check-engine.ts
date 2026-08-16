import { buildProgram } from "../lib/engine";
import type { Answers } from "../lib/types";

const a: Answers = {
  age: "19", sex: "male", heightCm: "179", weightKg: "93", bodyFatPct: "24",
  goal: "recomp", priority: "appearance",
  daysPerWeek: 5, sessionMin: 90,
  preferredDays: ["Monday","Tuesday","Wednesday","Saturday","Sunday"],
  needRestSpacing: true,
  experienceYears: "1", structuredPrograms: false,
  benchKg: "80", pullups: "8", squatKg: "", deadliftKg: "",
  equipment: ["barbell","dumbbell","cable","machine","squat-rack","smith","pullup-bar","leg-press"],
  equipmentPref: "combination",
  cannotDo: ["deadlift","rdl","dumbbell chest press"],
  priorityMuscles: ["chest","biceps"],
  avoidNearFailure: false,
  injuries: ["knees"],
  prefersSplit: "auto",
  dailySteps: "7-8k", sleepHours: "6", sports: "", dieting: true,
  includeCardio: true, includeCore: true,
};

const p = buildProgram(a);
console.log(p.title);
console.log(p.rationale);
console.log("\nSCHEDULE:");
p.weeklySchedule.forEach((s) => console.log(`  ${s.day}: ${s.focus} (~${s.durationMin}min)`));
console.log("\nVOLUME:");
p.weeklyVolume.forEach((v) => console.log(`  ${v.muscle}: ${v.sets}`));
console.log("\nWORKOUTS:");
p.workouts.forEach((d) => {
  console.log(`\n[${d.focus}] ~${d.durationMin}min`);
  d.exercises.forEach((e) => console.log(`  ${e.name} | ${e.sets}x${e.reps} | RIR ${e.rir} | ${e.rest} | ${e.notes ?? ""}`));
});
console.log("\nSUBSTITUTIONS:");
p.substitutions.forEach((s) => console.log(`  ${s.from} -> ${s.to}`));
