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

export type ExperienceLevel = "beginner" | "novice" | "intermediate" | "advanced";
export type GymType = "home" | "commercial";
export type IntensityPref = "easy" | "moderate" | "hard";
export type RecoveryLevel = "low" | "medium" | "high";
export type Severity = "mild" | "moderate" | "severe";
export type CorePref = "auto" | "yes" | "no";
export type CardioPref = "none" | "steady" | "hiit";
export type SwapReason = "equipment" | "injury" | "pain" | "dislike" | "other";

export interface InjuryDetail {
  severity: Severity;
  aggravating: string;
}

export interface ExerciseSwap {
  from: string;
  to: string;
  reason: SwapReason;
}

export interface Answers {
  age: string;
  sex: Sex;
  heightCm: string;
  weightKg: string;
  bodyFatPct?: string;

  goal: Goal;
  goalRank?: Goal[];
  targetWeightKg?: string;
  timelineMonths?: string;
  priority: Priority;

  daysPerWeek: number;
  sessionMin: number;
  preferredDays: string[];
  preferredDaysFixed?: boolean;
  needRestSpacing: boolean;
  maxConsecutiveDays?: number;

  experienceYears: string;
  experienceLevel?: ExperienceLevel;
  structuredPrograms: boolean;
  knowsRir?: boolean;
  benchKg?: string;
  pullups?: string;
  squatKg?: string;
  deadliftKg?: string;
  ohpKg?: string;

  gymType?: GymType;
  equipment: EquipmentId[];
  equipmentPref: "machines" | "free-weights" | "combination";

  cannotDo: string[];
  priorityMuscles: MuscleId[];
  maintainMuscles?: MuscleId[];
  dislikedExercises?: string[];
  enjoyedExercises?: string[];
  avoidNearFailure: boolean;
  intensityPref?: IntensityPref;

  injuries: InjuryId[];
  injuryDetails?: Partial<Record<InjuryId, InjuryDetail>>;

  recoveryLevel?: RecoveryLevel;
  sleepQuality?: string;
  proteinIntake?: string;
  dailySteps: string;
  sleepHours: string;
  sports?: string;
  dieting: boolean;

  prefersSplit?: "auto" | "ppl" | "upper-lower" | "upper-lower-accessories" | "full-body";
  includeCardio: boolean;
  includeCore: boolean;
  corePref?: CorePref;
  cardioPref?: CardioPref;

  swaps?: ExerciseSwap[];
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
  warnings: string[];
}