export type Goal = "fat-loss" | "muscle-gain" | "recomp" | "strength" | "combination";
export type Priority = "appearance" | "strength" | "fitness";
export type Sex = "male" | "female";
export type EquipmentId =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "squat-rack"
  | "smith"
  | "pullup-bar"
  | "leg-press";
export type InjuryId = "knees" | "shoulders" | "lower-back" | "elbows" | "wrists";
export type MuscleId =
  | "chest"
  | "back"
  | "lats"
  | "rear-delt"
  | "shoulders"
  | "triceps"
  | "biceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core";
export type Pattern =
  | "horizontal-push"
  | "vertical-push"
  | "horizontal-pull"
  | "vertical-pull"
  | "quad"
  | "hip"
  | "hamstring-iso"
  | "quad-iso"
  | "calf"
  | "core"
  | "biceps"
  | "triceps"
  | "lateral"
  | "rear-delt"
  | "chest-iso";

export interface Answers {
  age: string;
  sex: Sex;
  heightCm: string;
  weightKg: string;
  bodyFatPct?: string;

  goal: Goal;
  targetWeightKg?: string;
  timelineMonths?: string;
  priority: Priority;

  daysPerWeek: number;
  sessionMin: number;
  preferredDays: string[];
  needRestSpacing: boolean;

  experienceYears: string;
  structuredPrograms: boolean;
  benchKg?: string;
  pullups?: string;
  squatKg?: string;
  deadliftKg?: string;

  equipment: EquipmentId[];
  equipmentPref: "machines" | "free-weights" | "combination";

  cannotDo: string[];
  priorityMuscles: MuscleId[];
  avoidNearFailure: boolean;

  injuries: InjuryId[];
  prefersSplit?: "auto" | "ppl" | "upper-lower" | "full-body";

  dailySteps: string;
  sleepHours: string;
  sports?: string;
  dieting: boolean;

  includeCardio: boolean;
  includeCore: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  pattern: Pattern;
  muscles: MuscleId[];
  equipment: EquipmentId[];
  soloSafe: boolean;
  risk?: InjuryId[];
  sub?: string[];
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rir: number;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  focus: string;
  durationMin: number;
  exercises: WorkoutExercise[];
}

export interface VolumeRow {
  muscle: string;
  sets: number;
  reason: string;
}

export interface Substitution {
  from: string;
  to: string;
}

export interface Program {
  title: string;
  rationale: string;
  weeklySchedule: { day: string; focus: string; durationMin: number }[];
  workouts: WorkoutDay[];
  weeklyVolume: VolumeRow[];
  progression: string[];
  deload: { when: string; how: string[] };
  warmup: string[];
  cardio: string[];
  core: string;
  substitutions: Substitution[];
  twelveWeek: { weeks: string; focus: string }[];
}