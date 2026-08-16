"use client";

import { useState } from "react";
import type {
  Answers,
  CardioPref,
  CorePref,
  EquipmentId,
  ExperienceLevel,
  Goal,
  GymType,
  InjuryId,
  IntensityPref,
  MuscleId,
  Priority,
  RecoveryLevel,
  Severity,
  Sex,
} from "@/lib/types";

const GOALS: { value: Goal; label: string }[] = [
  { value: "recomp", label: "Recomp — lose fat, build muscle at the same time" },
  { value: "fat-loss", label: "Fat loss" },
  { value: "muscle-gain", label: "Muscle gain" },
  { value: "strength", label: "Strength" },
  { value: "combination", label: "A combination" },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "appearance", label: "Appearance (lean, athletic look)" },
  { value: "strength", label: "Strength numbers" },
  { value: "fitness", label: "General fitness" },
];

const EQUIPMENT: { value: EquipmentId; label: string }[] = [
  { value: "barbell", label: "Barbells & plates" },
  { value: "dumbbell", label: "Dumbbells" },
  { value: "cable", label: "Cable machines" },
  { value: "machine", label: "Plate-loaded / selectorized machines" },
  { value: "squat-rack", label: "Squat rack / power rack" },
  { value: "smith", label: "Smith machine" },
  { value: "pullup-bar", label: "Pull-up bar" },
  { value: "leg-press", label: "Leg press" },
];

const INJURIES: { value: InjuryId; label: string }[] = [
  { value: "knees", label: "Knees" },
  { value: "shoulders", label: "Shoulders" },
  { value: "lower-back", label: "Lower back" },
  { value: "elbows", label: "Elbows" },
  { value: "wrists", label: "Wrists" },
];

const MUSCLES: { value: MuscleId; label: string }[] = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back (overall)" },
  { value: "lats", label: "Lats / width" },
  { value: "shoulders", label: "Shoulders" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "quads", label: "Quads" },
  { value: "hamstrings", label: "Hamstrings" },
  { value: "glutes", label: "Glutes" },
  { value: "calves", label: "Calves" },
  { value: "core", label: "Abs / core" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_ANSWERS: Answers = {
  age: "",
  sex: "male",
  heightCm: "",
  weightKg: "",
  bodyFatPct: "",
  goal: "recomp",
  goalRank: [],
  targetWeightKg: "",
  timelineMonths: "",
  priority: "appearance",
  daysPerWeek: 5,
  sessionMin: 90,
  preferredDays: ["Monday", "Tuesday", "Wednesday", "Saturday", "Sunday"],
  preferredDaysFixed: true,
  needRestSpacing: true,
  maxConsecutiveDays: 2,
  experienceYears: "1",
  experienceLevel: undefined,
  structuredPrograms: false,
  knowsRir: false,
  benchKg: "",
  pullups: "",
  squatKg: "",
  deadliftKg: "",
  ohpKg: "",
  gymType: "commercial",
  equipment: ["barbell", "dumbbell", "cable", "machine", "squat-rack", "smith", "pullup-bar", "leg-press"],
  equipmentPref: "combination",
  cannotDo: [],
  priorityMuscles: [],
  maintainMuscles: [],
  dislikedExercises: [],
  enjoyedExercises: [],
  avoidNearFailure: false,
  intensityPref: "moderate",
  injuries: [],
  injuryDetails: {},
  recoveryLevel: "medium",
  sleepQuality: "",
  proteinIntake: "",
  dailySteps: "7-8k",
  sleepHours: "6",
  sports: "",
  dieting: true,
  prefersSplit: "auto",
  includeCardio: true,
  includeCore: true,
  corePref: "auto",
  cardioPref: "steady",
  swaps: [],
};

interface Props {
  onGenerate: (answers: Answers) => void;
  initial?: Answers;
}

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400";
const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-base font-semibold text-zinc-900">{title}</h2>
      {subtitle && <p className="mb-3 text-xs text-zinc-500">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ChipGroup<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              on
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function RadioGroup<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-start gap-2 text-sm text-zinc-700">
          <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} className="mt-0.5 accent-zinc-900" />
          <span>
            {o.label}
            {o.sub && <span className="block text-xs text-zinc-500">{o.sub}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

function isComplete(a: Answers): boolean {
  return Boolean(a.age && a.heightCm && a.weightKg && a.daysPerWeek >= 1 && a.experienceYears !== "");
}

export default function Questionnaire({ onGenerate, initial }: Props) {
  const [a, setA] = useState<Answers>({ ...DEFAULT_ANSWERS, ...(initial ?? {}) });

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((p) => ({ ...p, [k]: v }));
  const toggle = <K extends keyof Answers>(k: K, v: Answers[K] extends (infer T)[] | undefined ? T : never) =>
    setA((p) => {
      const arr = (p[k] as unknown as string[] | undefined) ?? [];
      return {
        ...p,
        [k]: (arr.includes(v as string) ? arr.filter((x) => x !== v) : [...arr, v]) as Answers[K],
      };
    });

  const need = isComplete(a);
  const showsInjuryDetails = a.injuries.length > 0;

  return (
    <div className="space-y-5">
      {/* 1 · Basic Profile */}
      <Section title="1 · Basic profile">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Age</label>
            <input type="number" className={inputCls} value={a.age} onChange={(e) => set("age", e.target.value)} placeholder="19" />
          </div>
          <div>
            <label className={labelCls}>Sex</label>
            <select className={inputCls} value={a.sex} onChange={(e) => set("sex", e.target.value as Sex)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Height (cm)</label>
            <input type="number" className={inputCls} value={a.heightCm} onChange={(e) => set("heightCm", e.target.value)} placeholder="179" />
          </div>
          <div>
            <label className={labelCls}>Weight (kg)</label>
            <input type="number" className={inputCls} value={a.weightKg} onChange={(e) => set("weightKg", e.target.value)} placeholder="93" />
          </div>
          <div>
            <label className={labelCls}>Body fat % (optional)</label>
            <input type="number" className={inputCls} value={a.bodyFatPct} onChange={(e) => set("bodyFatPct", e.target.value)} placeholder="24" />
          </div>
        </div>
      </Section>

      {/* 2 · Goal & Outcome */}
      <Section title="2 · Goal & outcome">
        <div>
          <label className={labelCls}>Primary goal</label>
          <RadioGroup name="goal" value={a.goal} onChange={(v) => set("goal", v)} options={GOALS.map((g) => ({ value: g.value, label: g.label }))} />
        </div>
        {a.goal === "combination" && (
          <div>
            <label className={labelCls}>Pick the top 2 that matter most</label>
            <ChipGroup
              options={GOALS.filter((g) => g.value !== "combination")}
              selected={(a.goalRank ?? []) as Goal[]}
              onToggle={(v) => {
                const rank = a.goalRank ?? [];
                const next = rank.includes(v) ? rank.filter((x) => x !== v) : rank.length < 2 ? [...rank, v] : rank;
                set("goalRank", next);
              }}
            />
          </div>
        )}
        <div>
          <label className={labelCls}>What matters more to you?</label>
          <RadioGroup name="priority" value={a.priority} onChange={(v) => set("priority", v)} options={PRIORITIES} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Target weight (kg, optional)</label>
            <input type="number" className={inputCls} value={a.targetWeightKg} onChange={(e) => set("targetWeightKg", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Timeline (months, optional)</label>
            <input type="number" className={inputCls} value={a.timelineMonths} onChange={(e) => set("timelineMonths", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* 3 · Training Availability */}
      <Section title="3 · Training availability">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Days per week</label>
            <select className={inputCls} value={a.daysPerWeek} onChange={(e) => set("daysPerWeek", Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Max session length (min)</label>
            <select className={inputCls} value={a.sessionMin} onChange={(e) => set("sessionMin", Number(e.target.value))}>
              {[45, 60, 75, 90, 120].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={a.preferredDaysFixed !== false} onChange={(e) => set("preferredDaysFixed", e.target.checked)} className="accent-zinc-900" />
            I have fixed days I can train
          </label>
          <p className="mt-1 text-xs text-zinc-500">Turn this off to let the program pick the best days for you.</p>
        </div>
        {a.preferredDaysFixed !== false && (
          <div>
            <label className={labelCls}>Preferred training days (pick {a.daysPerWeek})</label>
            <ChipGroup
              options={DAYS.map((d) => ({ value: d, label: d }))}
              selected={a.preferredDays}
              onToggle={(d) => {
                setA((p) => {
                  const on = p.preferredDays.includes(d);
                  const next = on
                    ? p.preferredDays.filter((x) => x !== d)
                    : p.preferredDays.length >= p.daysPerWeek
                      ? p.preferredDays
                      : [...p.preferredDays, d];
                  return { ...p, preferredDays: next };
                });
              }}
            />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={a.needRestSpacing} onChange={(e) => set("needRestSpacing", e.target.checked)} className="accent-zinc-900" />
          I want / need rest days between certain sessions
        </label>
        {a.needRestSpacing && (
          <div>
            <label className={labelCls}>Max consecutive training days</label>
            <select className={inputCls} value={a.maxConsecutiveDays ?? 2} onChange={(e) => set("maxConsecutiveDays", Number(e.target.value))}>
              {[1, 2, 3].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </Section>

      {/* 4 · Training Experience */}
      <Section title="4 · Training experience">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Experience level</label>
            <select
              className={inputCls}
              value={a.experienceLevel ?? ""}
              onChange={(e) => set("experienceLevel", (e.target.value || undefined) as ExperienceLevel | undefined)}
            >
              <option value="">Let me estimate from years</option>
              <option value="beginner">Beginner (first 6 months)</option>
              <option value="novice">Novice (up to a year)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3+ years)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Years lifting consistently</label>
            <input type="number" step="0.5" className={inputCls} value={a.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} placeholder="1" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={a.structuredPrograms} onChange={(e) => set("structuredPrograms", e.target.checked)} className="accent-zinc-900" />
          I&apos;ve followed structured programs before
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={a.knowsRir ?? false} onChange={(e) => set("knowsRir", e.target.checked)} className="accent-zinc-900" />
          I know what RIR / reps-in-reserve means
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Bench press (kg, optional)</label>
            <input type="number" className={inputCls} value={a.benchKg} onChange={(e) => set("benchKg", e.target.value)} placeholder="80" />
          </div>
          <div>
            <label className={labelCls}>Pull-ups (clean reps, optional)</label>
            <input type="number" className={inputCls} value={a.pullups} onChange={(e) => set("pullups", e.target.value)} placeholder="8" />
          </div>
          <div>
            <label className={labelCls}>Squat (kg, optional)</label>
            <input type="number" className={inputCls} value={a.squatKg} onChange={(e) => set("squatKg", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Deadlift (kg, optional)</label>
            <input type="number" className={inputCls} value={a.deadliftKg} onChange={(e) => set("deadliftKg", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Overhead press (kg, optional)</label>
            <input type="number" className={inputCls} value={a.ohpKg} onChange={(e) => set("ohpKg", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* 5 · Gym & Equipment */}
      <Section title="5 · Gym & equipment">
        <div>
          <label className={labelCls}>Where do you train?</label>
          <RadioGroup
            name="gymType"
            value={a.gymType ?? "commercial"}
            onChange={(v) => set("gymType", v as GymType)}
            options={[
              { value: "commercial", label: "A gym / commercial facility", sub: "Full machine + free weight lineup" },
              { value: "home", label: "Home gym", sub: "I only have what I list below" },
            ]}
          />
        </div>
        <div>
          <label className={labelCls}>What equipment is available?</label>
          <ChipGroup options={EQUIPMENT} selected={a.equipment} onToggle={(v) => toggle("equipment", v)} />
        </div>
        <div>
          <label className={labelCls}>Preference</label>
          <RadioGroup
            name="equipPref"
            value={a.equipmentPref}
            onChange={(v) => set("equipmentPref", v as Answers["equipmentPref"])}
            options={[
              { value: "machines", label: "Machines / cables" },
              { value: "free-weights", label: "Free weights" },
              { value: "combination", label: "Mix of both" },
            ]}
          />
        </div>
      </Section>

      {/* 6 · Exercise & Muscle Preferences */}
      <Section title="6 · Exercise & muscle preferences">
        <div>
          <label className={labelCls}>Muscle groups to prioritize (build)</label>
          <ChipGroup options={MUSCLES} selected={a.priorityMuscles} onToggle={(v) => toggle("priorityMuscles", v)} />
        </div>
        <div>
          <label className={labelCls}>Muscle groups to keep / maintain (optional)</label>
          <ChipGroup options={MUSCLES} selected={a.maintainMuscles ?? []} onToggle={(v) => toggle("maintainMuscles", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Exercises you can&apos;t perform (name them)</label>
            <input
              className={inputCls}
              value={a.cannotDo.join(", ")}
              onChange={(e) => set("cannotDo", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="deadlift, rdl, dumbbell chest press"
            />
          </div>
          <div>
            <label className={labelCls}>Exercises you dislike (optional)</label>
            <input
              className={inputCls}
              value={(a.dislikedExercises ?? []).join(", ")}
              onChange={(e) => set("dislikedExercises", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="pull-ups, hack squat"
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>How close to failure do you want to train?</label>
          <RadioGroup
            name="intensity"
            value={a.intensityPref ?? "moderate"}
            onChange={(v) => set("intensityPref", v as IntensityPref)}
            options={[
              { value: "easy", label: "Keep reps in reserve (easier)", sub: "Stay 3+ reps from failure — safer, great for beginners" },
              { value: "moderate", label: "Moderate (recommended)", sub: "About 2 reps in reserve on most sets" },
              { value: "hard", label: "Push close to failure", sub: "0-1 reps in reserve — max stimulus, more fatigue" },
            ]}
          />
        </div>
      </Section>

      {/* 7 · Pain, Injury & Movement Restrictions */}
      <Section
        title="7 · Pain, injury & movement restrictions"
        subtitle="Used to pick safer exercises — this is not medical advice. If pain is sharp or persistent, see a professional."
      >
        <div>
          <label className={labelCls}>Any injuries / problem areas?</label>
          <ChipGroup options={INJURIES} selected={a.injuries} onToggle={(v) => toggle("injuries", v)} />
        </div>
        {showsInjuryDetails && (
          <div className="space-y-3">
            {a.injuries.map((inj) => {
              const detail = a.injuryDetails?.[inj];
              return (
                <div key={inj} className="rounded-lg border border-zinc-200 p-3">
                  <p className="mb-2 text-sm font-medium capitalize text-zinc-800">{inj.replace("-", " ")}</p>
                  <div className="mb-2">
                    <label className={labelCls}>How limiting is it right now?</label>
                    <RadioGroup
                      name={`severity-${inj}`}
                      value={detail?.severity ?? "mild"}
                      onChange={(v) => set("injuryDetails", { ...(a.injuryDetails ?? {}), [inj]: { ...(detail ?? { severity: "mild" as Severity, aggravating: "" }), severity: v as Severity } })}
                      options={[
                        { value: "mild", label: "Mild — fine with lighter loads" },
                        { value: "moderate", label: "Moderate — some movements aggravate it" },
                        { value: "severe", label: "Severe / currently painful" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Movements that make it worse (optional)</label>
                    <input
                      className={inputCls}
                      value={detail?.aggravating ?? ""}
                      onChange={(e) => set("injuryDetails", { ...(a.injuryDetails ?? {}), [inj]: { ...(detail ?? { severity: "mild" as Severity, aggravating: "" }), aggravating: e.target.value } })}
                      placeholder="deep squat, heavy pressing"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* 8 · Recovery, Lifestyle & Nutrition */}
      <Section title="8 · Recovery, lifestyle & nutrition">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Avg daily steps</label>
            <select className={inputCls} value={a.dailySteps} onChange={(e) => set("dailySteps", e.target.value)}>
              {["Under 5k", "5-6k", "7-8k", "9-10k", "10k+"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Avg sleep (hours)</label>
            <select className={inputCls} value={a.sleepHours} onChange={(e) => set("sleepHours", e.target.value)}>
              {["<5", "5", "6", "7", "8", "9+"].map((s) => (
                <option key={s} value={s}>{s}h</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Overall recovery right now</label>
          <RadioGroup
            name="recovery"
            value={a.recoveryLevel ?? "medium"}
            onChange={(v) => set("recoveryLevel", v as RecoveryLevel)}
            options={[
              { value: "high", label: "High — sleeping well, feeling fresh" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low — tired, stressed, sleep is rough" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Other sports / cardio (optional)</label>
            <input className={inputCls} value={a.sports} onChange={(e) => set("sports", e.target.value)} placeholder="e.g. boxing, football" />
          </div>
          <div>
            <label className={labelCls}>Protein intake (optional)</label>
            <select className={inputCls} value={a.proteinIntake ?? ""} onChange={(e) => set("proteinIntake", e.target.value || undefined)}>
              <option value="">Not sure</option>
              {["Low (<0.8g/kg)", "Okay (0.8-1.2g/kg)", "High (1.2-1.6g/kg)", "Very high (1.6g+/kg)"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Nutrition</label>
          <RadioGroup
            name="diet"
            value={a.dieting ? "deficit" : "maintenance"}
            onChange={(v) => set("dieting", v === "deficit")}
            options={[
              { value: "deficit", label: "I&apos;m eating at a calorie deficit (cutting / recomp)" },
              { value: "maintenance", label: "Eating at maintenance or a surplus (bulking / maintaining)" },
            ]}
          />
        </div>
      </Section>

      {/* 9 · Program Preferences */}
      <Section title="9 · Program preferences">
        <div>
          <label className={labelCls}>Split preference (optional)</label>
          <RadioGroup
            name="split"
            value={a.prefersSplit ?? "auto"}
            onChange={(v) => set("prefersSplit", v as Answers["prefersSplit"])}
            options={[
              { value: "auto", label: "Auto — pick what fits my schedule (recommended)" },
              { value: "ppl", label: "Push / Pull / Legs" },
              { value: "upper-lower", label: "Upper / Lower" },
              { value: "upper-lower-accessories", label: "Upper / Lower + an accessories day" },
              { value: "full-body", label: "Full body" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Core / ab work</label>
            <select className={inputCls} value={a.corePref ?? "auto"} onChange={(e) => set("corePref", e.target.value as CorePref)}>
              <option value="auto">Auto (recommended)</option>
              <option value="yes">Include it</option>
              <option value="no">Skip it</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Cardio</label>
            <select className={inputCls} value={a.cardioPref ?? (a.includeCardio ? "steady" : "none")} onChange={(e) => set("cardioPref", e.target.value as CardioPref)}>
              <option value="steady">Steady state (recommended)</option>
              <option value="hiit">Short high-intensity intervals</option>
              <option value="none">None — just daily steps</option>
            </select>
          </div>
        </div>
      </Section>

      {!need && (
        <p className="text-sm text-amber-700">
          Fill in age, height, weight, days/week and experience to generate your program.
        </p>
      )}

      <button
        type="button"
        disabled={!need}
        onClick={() => onGenerate(a)}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        Generate my program
      </button>
    </div>
  );
}