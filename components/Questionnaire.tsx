"use client";

import { useState } from "react";
import type {
  Answers,
  EquipmentId,
  Goal,
  InjuryId,
  MuscleId,
  Priority,
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
  targetWeightKg: "",
  timelineMonths: "",
  priority: "appearance",
  daysPerWeek: 5,
  sessionMin: 90,
  preferredDays: ["Monday", "Tuesday", "Wednesday", "Saturday", "Sunday"],
  needRestSpacing: true,
  experienceYears: "1",
  structuredPrograms: false,
  benchKg: "",
  pullups: "",
  squatKg: "",
  deadliftKg: "",
  equipment: ["barbell", "dumbbell", "cable", "machine", "squat-rack", "smith", "pullup-bar", "leg-press"],
  equipmentPref: "combination",
  cannotDo: [],
  priorityMuscles: [],
  avoidNearFailure: false,
  injuries: [],
  prefersSplit: "auto",
  dailySteps: "7-8k",
  sleepHours: "6",
  sports: "",
  dieting: true,
  includeCardio: true,
  includeCore: true,
};

interface Props {
  onGenerate: (answers: Answers) => void;
  initial?: Answers;
}

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400";
const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-zinc-900">{title}</h2>
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

export default function Questionnaire({ onGenerate, initial }: Props) {
  const [a, setA] = useState<Answers>({ ...DEFAULT_ANSWERS, ...(initial ?? {}) });

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((p) => ({ ...p, [k]: v }));
  const toggle = <K extends keyof Answers>(k: K, v: Answers[K] extends (infer T)[] ? T : never) =>
    setA((p) => {
      const arr = p[k] as unknown as string[];
      return {
        ...p,
        [k]: arr.includes(v as string) ? arr.filter((x) => x !== v) : [...arr, v],
      };
    });

  const summary =
    a.age && a.heightCm && a.weightKg && a.daysPerWeek >= 1 && a.experienceYears !== "";

  return (
    <div className="space-y-5">
      <Section title="1 · Basic stats">
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
            <label className={labelCls}>Body fat % (if known)</label>
            <input type="number" className={inputCls} value={a.bodyFatPct} onChange={(e) => set("bodyFatPct", e.target.value)} placeholder="24" />
          </div>
        </div>
      </Section>

      <Section title="2 · Goal">
        <div>
          <label className={labelCls}>Primary goal</label>
          <div className="space-y-2">
            {GOALS.map((g) => (
              <label key={g.value} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input
                  type="radio"
                  name="goal"
                  checked={a.goal === g.value}
                  onChange={() => set("goal", g.value)}
                  className="accent-zinc-900"
                />
                {g.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>What matters more to you?</label>
          <div className="space-y-2">
            {PRIORITIES.map((p) => (
              <label key={p.value} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input type="radio" name="priority" checked={a.priority === p.value} onChange={() => set("priority", p.value)} className="accent-zinc-900" />
                {p.label}
              </label>
            ))}
          </div>
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
          <label className={labelCls}>Preferred training days (pick {a.daysPerWeek})</label>
          <ChipGroup options={DAYS.map((d) => ({ value: d, label: d }))} selected={a.preferredDays} onToggle={(d) => {
            setA((p) => {
              const on = p.preferredDays.includes(d);
              const next = on
                ? p.preferredDays.filter((x) => x !== d)
                : p.preferredDays.length >= p.daysPerWeek
                  ? p.preferredDays
                  : [...p.preferredDays, d];
              return { ...p, preferredDays: next };
            });
          }} />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={a.needRestSpacing} onChange={(e) => set("needRestSpacing", e.target.checked)} className="accent-zinc-900" />
          I want / need rest days between certain sessions
        </label>
      </Section>

      <Section title="4 · Training experience">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Years lifting consistently</label>
            <input type="number" step="0.5" className={inputCls} value={a.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} placeholder="1" />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm text-zinc-700">
            <input type="checkbox" checked={a.structuredPrograms} onChange={(e) => set("structuredPrograms", e.target.checked)} className="accent-zinc-900" />
            I&apos;ve followed structured programs before
          </label>
        </div>
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
        </div>
      </Section>

      <Section title="5 · Gym & equipment">
        <div>
          <label className={labelCls}>What equipment is available?</label>
          <ChipGroup options={EQUIPMENT} selected={a.equipment} onToggle={(v) => toggle("equipment", v)} />
        </div>
        <div>
          <label className={labelCls}>Preference</label>
          <div className="space-y-2">
            {[
              { value: "machines", label: "Machines / cables" },
              { value: "free-weights", label: "Free weights" },
              { value: "combination", label: "Mix of both" },
            ].map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input type="radio" name="equipPref" checked={a.equipmentPref === o.value} onChange={() => set("equipmentPref", o.value as Answers["equipmentPref"])} className="accent-zinc-900" />
                {o.label}
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section title="6 · Exercise preferences">
        <div>
          <label className={labelCls}>Exercises you cannot perform (name them)</label>
          <input
            className={inputCls}
            value={a.cannotDo.join(", ")}
            onChange={(e) =>
              set("cannotDo", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
            }
            placeholder="deadlift, rdl, dumbbell chest press"
          />
        </div>
        <div>
          <label className={labelCls}>Muscle groups to prioritize</label>
          <ChipGroup options={MUSCLES} selected={a.priorityMuscles} onToggle={(v) => toggle("priorityMuscles", v)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={a.avoidNearFailure} onChange={(e) => set("avoidNearFailure", e.target.checked)} className="accent-zinc-900" />
          I prefer to avoid training very close to failure
        </label>
      </Section>

      <Section title="7 · Injury & pain">
        <div>
          <label className={labelCls}>Any injuries / problem areas?</label>
          <ChipGroup options={INJURIES} selected={a.injuries} onToggle={(v) => toggle("injuries", v)} />
        </div>
      </Section>

      <Section title="8 · Lifestyle & recovery">
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
          <label className={labelCls}>Other sports / cardio (optional)</label>
          <input className={inputCls} value={a.sports} onChange={(e) => set("sports", e.target.value)} placeholder="e.g. boxing, football" />
        </div>
        <div>
          <label className={labelCls}>Nutrition</label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            <input type="radio" name="diet" checked={a.dieting} onChange={() => set("dieting", true)} className="accent-zinc-900" />
            I&apos;m eating at a calorie deficit (cutting / recomp)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            <input type="radio" name="diet" checked={!a.dieting} onChange={() => set("dieting", false)} className="accent-zinc-900" />
            Eating at maintenance or a surplus (bulking / maintaining)
          </label>
        </div>
      </Section>

      <Section title="9 · Preferences">
        <div>
          <label className={labelCls}>Split preference (optional)</label>
          <div className="space-y-2">
            {[
              { value: "auto", label: "Auto — pick what fits my schedule (recommended)" },
              { value: "ppl", label: "Push / Pull / Legs" },
              { value: "upper-lower", label: "Upper / Lower" },
              { value: "full-body", label: "Full body" },
            ].map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                <input type="radio" name="split" checked={a.prefersSplit === o.value} onChange={() => set("prefersSplit", o.value as Answers["prefersSplit"])} className="accent-zinc-900" />
                {o.label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={a.includeCore} onChange={(e) => set("includeCore", e.target.checked)} className="accent-zinc-900" />
            Include dedicated ab / core work
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={a.includeCardio} onChange={(e) => set("includeCardio", e.target.checked)} className="accent-zinc-900" />
            Include cardio guidance
          </label>
        </div>
      </Section>

      {!summary && (
        <p className="text-sm text-amber-700">
          Fill in age, height, weight, days/week and experience to generate your program.
        </p>
      )}

      <button
        type="button"
        disabled={!summary}
        onClick={() => onGenerate(a)}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        Generate my program
      </button>
    </div>
  );
}