import type { Exercise } from "./types";

export const EXERCISES: Exercise[] = [
  // ---------- CHEST ----------
  { id: "incline-bb", name: "Incline Barbell Bench Press", pattern: "horizontal-push", muscles: ["chest", "triceps", "shoulders"], equipment: ["barbell", "squat-rack"], soloSafe: true, sub: ["incline-smith", "machine-chest-press"], notes: "Main lift. Bench in a rack or with safeties if training solo." },
  { id: "incline-smith", name: "Incline Smith Machine Press", pattern: "horizontal-push", muscles: ["chest", "triceps", "shoulders"], equipment: ["smith"], soloSafe: true, risk: ["shoulders"], notes: "Guided path — safer solo than free barbell." },
  { id: "flat-bb", name: "Flat Barbell Bench Press", pattern: "horizontal-push", muscles: ["chest", "triceps", "shoulders"], equipment: ["barbell", "squat-rack"], soloSafe: true, sub: ["flat-smith", "machine-chest-press"], notes: "Use safeties — no dumbbell presses solo." },
  { id: "flat-smith", name: "Flat Smith Machine Press", pattern: "horizontal-push", muscles: ["chest", "triceps", "shoulders"], equipment: ["smith"], soloSafe: true, notes: "Same pattern, guided bar path." },
  { id: "machine-chest-press", name: "Machine Chest Press", pattern: "horizontal-push", muscles: ["chest", "triceps"], equipment: ["machine"], soloSafe: true, sub: ["flat-smith", "incline-smith"], notes: "Safe to push close to failure solo." },
  { id: "db-chest-press", name: "Dumbbell Chest Press", pattern: "horizontal-push", muscles: ["chest", "triceps", "shoulders"], equipment: ["dumbbell"], soloSafe: false, notes: "Avoid if training alone — getting pinned is the risk." },
  { id: "cable-fly", name: "Cable Fly (mid or low-to-high)", pattern: "chest-iso", muscles: ["chest"], equipment: ["cable"], soloSafe: true, notes: "Squeeze at peak, slow eccentric." },
  { id: "pec-deck", name: "Pec Deck / Machine Fly", pattern: "chest-iso", muscles: ["chest"], equipment: ["machine"], soloSafe: true, sub: ["cable-fly"], notes: "Easy machine isolation." },

  // ---------- SHOULDERS ----------
  { id: "seated-db-shoulder", name: "Seated Dumbbell Shoulder Press", pattern: "vertical-push", muscles: ["shoulders", "triceps"], equipment: ["dumbbell"], soloSafe: true, risk: ["shoulders"], notes: "Safe solo — risk is only heavy DB chest press, not overhead." },
  { id: "machine-shoulder", name: "Machine Shoulder Press", pattern: "vertical-push", muscles: ["shoulders", "triceps"], equipment: ["machine"], soloSafe: true, sub: ["seated-db-shoulder"], notes: "Guided path, knee-friendly setup." },
  { id: "lateral-cable", name: "Cable Lateral Raise", pattern: "lateral", muscles: ["shoulders"], equipment: ["cable"], soloSafe: true, sub: ["lateral-db"], notes: "Light, strict, no swinging." },
  { id: "lateral-db", name: "Dumbbell Lateral Raise", pattern: "lateral", muscles: ["shoulders"], equipment: ["dumbbell"], soloSafe: true, notes: "Light, strict, no swinging." },

  // ---------- BACK ----------
  { id: "pullups", name: "Weighted or Assisted Pull-ups", pattern: "vertical-pull", muscles: ["lats", "back", "biceps"], equipment: ["pullup-bar"], soloSafe: true, sub: ["lat-pulldown", "assisted-pullup"], notes: "Add weight once you hit 10 clean bodyweight reps." },
  { id: "assisted-pullup", name: "Assisted Pull-up Machine", pattern: "vertical-pull", muscles: ["lats", "back", "biceps"], equipment: ["machine"], soloSafe: true, notes: "Counterweight lets you train the pull-up pattern." },
  { id: "lat-wide", name: "Lat Pulldown (wide grip)", pattern: "vertical-pull", muscles: ["lats", "back"], equipment: ["cable"], soloSafe: true, notes: "Different angle than pull-ups." },
  { id: "lat-neutral", name: "Lat Pulldown (close/neutral grip)", pattern: "vertical-pull", muscles: ["lats", "back", "biceps"], equipment: ["cable"], soloSafe: true, notes: "Neutral grip is shoulder-friendly." },
  { id: "seated-cable-row", name: "Seated Cable Row", pattern: "horizontal-pull", muscles: ["back", "lats", "biceps"], equipment: ["cable"], soloSafe: true, notes: "Chest up, drive elbows back, no lower-back yanking." },
  { id: "machine-row", name: "Chest-Supported Machine Row", pattern: "horizontal-pull", muscles: ["back", "lats", "biceps"], equipment: ["machine"], soloSafe: true, sub: ["seated-cable-row"], notes: "Removes lower-back involvement entirely." },
  { id: "one-arm-db-row", name: "One-Arm Dumbbell Row", pattern: "horizontal-pull", muscles: ["back", "lats", "biceps"], equipment: ["dumbbell"], soloSafe: true, risk: ["lower-back"], notes: "Braced on a bench — don't let the lower back round." },
  { id: "barbell-row", name: "Barbell Bent-Over Row", pattern: "horizontal-pull", muscles: ["back", "lats", "biceps"], equipment: ["barbell"], soloSafe: true, risk: ["lower-back"], sub: ["machine-row", "seated-cable-row"], notes: "Braced torso, hinged at hips." },
  { id: "face-pull", name: "Face Pull", pattern: "rear-delt", muscles: ["rear-delt", "shoulders"], equipment: ["cable"], soloSafe: true, notes: "Rear delt + upper back health, keep light." },
  { id: "reverse-pec-deck", name: "Reverse Pec Deck", pattern: "rear-delt", muscles: ["rear-delt", "shoulders"], equipment: ["machine"], soloSafe: true, sub: ["face-pull"], notes: "Easy rear-delt isolation." },

  // ---------- ARMS ----------
  { id: "preacher-db", name: "Dumbbell Preacher / Incline Curl", pattern: "biceps", muscles: ["biceps"], equipment: ["dumbbell"], soloSafe: true, risk: ["elbows"], notes: "Strong point for you — keep it, don't overdo volume." },
  { id: "cable-curl", name: "Cable Curl", pattern: "biceps", muscles: ["biceps"], equipment: ["cable"], soloSafe: true, notes: "Constant-tension finisher." },
  { id: "ez-curl", name: "EZ Bar Curl", pattern: "biceps", muscles: ["biceps"], equipment: ["barbell"], soloSafe: true, sub: ["preacher-db"], notes: "EZ grip spares the wrists." },
  { id: "rope-pushdown", name: "Triceps Rope Pushdown", pattern: "triceps", muscles: ["triceps"], equipment: ["cable"], soloSafe: true, notes: "You're strong here — maintain, don't overbuild." },
  { id: "overhead-cable-ext", name: "Overhead Cable Triceps Extension", pattern: "triceps", muscles: ["triceps"], equipment: ["cable"], soloSafe: true, risk: ["elbows"], notes: "Stretch-focused, controls elbow strain." },
  { id: "machine-triceps", name: "Machine Triceps Extension", pattern: "triceps", muscles: ["triceps"], equipment: ["machine"], soloSafe: true, sub: ["rope-pushdown"], notes: "Stable alternative if elbows are cranky." },

  // ---------- QUADS ----------
  { id: "leg-press", name: "Leg Press", pattern: "quad", muscles: ["quads", "glutes", "hamstrings"], equipment: ["leg-press", "machine"], soloSafe: true, notes: "Feet mid-to-high, don't lock out knees hard." },
  { id: "hack-squat", name: "Hack Squat", pattern: "quad", muscles: ["quads", "glutes"], equipment: ["machine"], soloSafe: true, sub: ["smith-squat", "leg-press"], notes: "Guided bar path — no solo-safety concern." },
  { id: "smith-squat", name: "Smith Machine Squat", pattern: "quad", muscles: ["quads", "glutes"], equipment: ["smith"], soloSafe: true, sub: ["leg-press"], notes: "Guided path, easy to bail." },
  { id: "bb-back-squat", name: "Barbell Back Squat", pattern: "quad", muscles: ["quads", "glutes"], equipment: ["barbell", "squat-rack"], soloSafe: true, risk: ["knees", "lower-back"], sub: ["smith-squat", "leg-press"], notes: "Only if knees are fine — use safeties." },
  { id: "goblet-squat", name: "Goblet Squat", pattern: "quad", muscles: ["quads", "glutes", "core"], equipment: ["dumbbell"], soloSafe: true, notes: "Light-moderate, controlled depth, knee-friendly." },
  { id: "leg-extension", name: "Leg Extension", pattern: "quad-iso", muscles: ["quads"], equipment: ["machine"], soloSafe: true, risk: ["knees"], sub: ["leg-press"], notes: "Controlled tempo, no snapping to lockout." },

  // ---------- POSTERIOR CHAIN ----------
  { id: "hip-thrust", name: "Barbell or Smith Hip Thrust", pattern: "hip", muscles: ["glutes", "hamstrings"], equipment: ["barbell", "smith"], soloSafe: true, sub: ["glute-bridge-machine", "cable-pullthrough"], notes: "Main hip-hinge — same glute/ham stimulus as deadlifts, safer solo." },
  { id: "glute-bridge-machine", name: "Glute Bridge Machine", pattern: "hip", muscles: ["glutes", "hamstrings"], equipment: ["machine"], soloSafe: true, notes: "If your gym has one." },
  { id: "cable-pullthrough", name: "Cable Pull-Through", pattern: "hip", muscles: ["glutes", "hamstrings"], equipment: ["cable"], soloSafe: true, sub: ["back-extension"], notes: "Hip hinge with no floor-loading risk." },
  { id: "back-extension", name: "45° Back Extension", pattern: "hip", muscles: ["hamstrings", "glutes", "back"], equipment: ["machine"], soloSafe: true, risk: ["lower-back"], notes: "Hinge pattern without loading the spine directly." },
  { id: "leg-curl-lying", name: "Lying Leg Curl", pattern: "hamstring-iso", muscles: ["hamstrings"], equipment: ["machine"], soloSafe: true, notes: "Balances quad work and helps knee stability." },
  { id: "leg-curl-seated", name: "Seated Leg Curl", pattern: "hamstring-iso", muscles: ["hamstrings"], equipment: ["machine"], soloSafe: true, sub: ["leg-curl-lying"], notes: "Seated variant if lying is unavailable." },

  // ---------- CALVES ----------
  { id: "calf-standing", name: "Standing Calf Raise", pattern: "calf", muscles: ["calves"], equipment: ["machine"], soloSafe: true, notes: "" },
  { id: "calf-seated", name: "Seated Calf Raise", pattern: "calf", muscles: ["calves"], equipment: ["machine"], soloSafe: true, notes: "" },

  // ---------- CORE ----------
  { id: "cable-crunch", name: "Cable Crunch", pattern: "core", muscles: ["core"], equipment: ["cable"], soloSafe: true, notes: "" },
  { id: "hanging-knee-raise", name: "Hanging or Lying Knee Raise", pattern: "core", muscles: ["core"], equipment: ["pullup-bar"], soloSafe: true, sub: ["plank"], notes: "" },
  { id: "plank", name: "Plank", pattern: "core", muscles: ["core"], equipment: ["machine"], soloSafe: true, notes: "Hold for time — easy to do anywhere." },
  { id: "ab-machine", name: "Ab Machine / Crunch Machine", pattern: "core", muscles: ["core"], equipment: ["machine"], soloSafe: true, sub: ["cable-crunch"], notes: "" },
];

export const byId = (id: string): Exercise | undefined => EXERCISES.find((e) => e.id === id);

export const MUSCLE_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  lats: "Lats",
  rearDelt: "Rear delts",
  shoulders: "Shoulders (lateral/rear)",
  triceps: "Triceps",
  biceps: "Biceps",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  core: "Abs/core",
};