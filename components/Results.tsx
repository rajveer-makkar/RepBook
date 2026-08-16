"use client";

import { useState } from "react";
import type { Answers, ExerciseSwap, Program, SwapReason } from "@/lib/types";
import { suggestReplacements } from "@/lib/engine";
import SaveProgramButton from "@/components/SaveProgramButton";

interface Props {
  program: Program;
  answers?: Answers;
  onSwap?: (swap: ExerciseSwap) => void;
  aiRationale?: string;
  aiLoading?: boolean;
  aiError?: string;
  onEnhance?: () => void;
  onReset?: () => void;
  onSave?: (name: string) => void;
  saving?: boolean;
  saveError?: string;
}

const SWAP_REASONS: { value: SwapReason; label: string }[] = [
  { value: "equipment", label: "My gym doesn't have this machine" },
  { value: "injury", label: "I'm worried about injuring myself" },
  { value: "pain", label: "It causes pain / discomfort" },
  { value: "dislike", label: "I just don't like it" },
  { value: "other", label: "Other" },
];

function SwapPanel({
  exerciseId,
  exerciseName,
  answers,
  onApply,
  onCancel,
}: {
  exerciseId: string;
  exerciseName: string;
  answers: Answers;
  onApply: (to: string, reason: SwapReason) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<SwapReason | null>(null);
  const candidates = reason ? suggestReplacements(exerciseId, reason, answers) : [];

  return (
    <div className="mt-2 rounded-lg border border-zinc-300 bg-zinc-50 p-3">
      <p className="mb-2 text-sm font-medium text-zinc-900">Why remove {exerciseName}?</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {SWAP_REASONS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setReason(r.value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              reason === r.value
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {reason && (
        <>
          {candidates.length > 0 ? (
            <>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Replacements for the same muscle group
              </p>
              <div className="space-y-2">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onApply(c.id, reason)}
                    className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left transition hover:border-zinc-900"
                  >
                    <span className="block text-sm font-medium text-zinc-900">{c.name}</span>
                    <span className="block text-xs text-zinc-500">{c.note}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onApply("", reason)}
                  className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-600 transition hover:border-zinc-900"
                >
                  Just remove it — no replacement
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              No replacement matches your equipment and constraints.{" "}
              <button type="button" onClick={() => onApply("", reason)} className="font-medium text-zinc-900 underline">
                Remove it anyway
              </button>
            </p>
          )}
        </>
      )}
      <button type="button" onClick={onCancel} className="mt-2 text-xs text-zinc-500 underline">
        Cancel
      </button>
    </div>
  );
}

function TrackerTable({ day, answers, onSwap }: { day: Program["workouts"][number]; answers?: Answers; onSwap?: Props["onSwap"] }) {
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const header = ["Exercise", "Set 1", "Set 2", "Set 3", "Set 4", "Target Reps", "Target RIR", "Rest", "Notes"];
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-zinc-100">
            {header.map((h) => (
              <th key={h} className="border-b border-zinc-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {day.exercises.map((e) => (
            <tr key={e.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900">{e.name}</span>
                  {onSwap && answers && (
                    <button
                      type="button"
                      onClick={() => setSwappingId(swappingId === e.id ? null : e.id)}
                      className="rounded border border-zinc-300 px-1.5 py-0.5 text-xs text-zinc-500 transition hover:border-zinc-900 hover:text-zinc-900"
                    >
                      Swap
                    </button>
                  )}
                </div>
                {swappingId === e.id && onSwap && answers && (
                  <SwapPanel
                    exerciseId={e.id}
                    exerciseName={e.name}
                    answers={answers}
                    onCancel={() => setSwappingId(null)}
                    onApply={(to, swapReason) => {
                      onSwap?.({ from: e.id, to, reason: swapReason });
                      setSwappingId(null);
                    }}
                  />
                )}
              </td>
              {[1, 2, 3, 4].map((n) => (
                <td key={n} className={`px-3 py-2 text-zinc-600 ${n > e.sets ? "bg-zinc-50" : ""}`}>
                  {n <= e.sets ? "" : "—"}
                </td>
              ))}
              <td className="px-3 py-2 whitespace-nowrap text-zinc-700">{e.reps}</td>
              <td className="px-3 py-2 text-zinc-700">{e.rir}</td>
              <td className="px-3 py-2 whitespace-nowrap text-zinc-700">{e.rest}</td>
              <td className="px-3 py-2 text-xs text-zinc-500">{e.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Results({
  program,
  answers,
  onSwap,
  aiRationale,
  aiLoading,
  aiError,
  onEnhance,
  onReset,
  onSave,
  saving,
  saveError,
}: Props) {
  const [copied, setCopied] = useState(false);

  const rationale = aiRationale || program.rationale;

  const copyAll = async () => {
    const text = [
      `# ${program.title}`,
      "",
      rationale,
      "",
      "## Weekly schedule",
      ...program.weeklySchedule.map((s) => `- ${s.day}: ${s.focus} (~${s.durationMin} min)`),
      "",
      "## Weekly volume",
      ...program.weeklyVolume.map((v) => `- ${v.muscle}: ${v.sets} sets — ${v.reason}`),
      "",
      ...program.workouts.map((d) => [
        "",
        `## ${d.focus} (~${d.durationMin} min)`,
        "",
        "| Exercise | Set 1 | Set 2 | Set 3 | Set 4 | Target Reps | Target RIR | Rest | Notes |",
        "|---|---|---|---|---|---|---|---|---|",
        ...d.exercises.map((e) => `| ${e.name} | | | | | ${e.reps} | ${e.rir} | ${e.rest} | ${e.notes ?? ""} |`),
      ].join("\n")),
      "",
      "## Progression",
      ...program.progression,
      "",
      "## Deload",
      `**When:** ${program.deload.when}`,
      ...program.deload.how.map((h) => `- ${h}`),
      "",
      "## Warm-up",
      ...program.warmup.map((w) => `- ${w}`),
      "",
      "## Cardio",
      ...program.cardio.map((c) => `- ${c}`),
      "",
      `## Core\n${program.core}`,
      "",
      "## Substitutions",
      ...program.substitutions.map((s) => `- ${s.from} → ${s.to}`),
      "",
      "## 12-week framework",
      ...program.twelveWeek.map((t) => `- **Weeks ${t.weeks}:** ${t.focus}`),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">{program.title}</h1>
        <div className="flex gap-2">
          {onEnhance && !aiRationale && (
            <button
              onClick={onEnhance}
              disabled={aiLoading}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-50"
            >
              {aiLoading ? "Writing…" : "✨ AI explain why this works"}
            </button>
          )}
          {onSave && <SaveProgramButton onSave={onSave} saving={saving} />}
          <button
            onClick={copyAll}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            {copied ? "Copied!" : "Copy full program"}
          </button>
        </div>
      </div>

      {aiError && <p className="text-sm text-red-600">{aiError}</p>}
      {saveError && <p className="text-sm text-red-600">{saveError}</p>}
      <p className="text-sm leading-relaxed text-zinc-700">{rationale}</p>

      {program.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1 text-sm font-semibold text-amber-900">Program notes</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
            {program.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Weekly schedule</h2>
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="bg-zinc-100">
                {["Day", "Focus", "Duration"].map((h) => (
                  <th key={h} className="border-b border-zinc-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {program.weeklySchedule.map((s) => (
                <tr key={s.day} className="border-b border-zinc-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-zinc-900">{s.day}</td>
                  <td className="px-3 py-2 text-zinc-700">{s.focus}</td>
                  <td className="px-3 py-2 text-zinc-700">~{s.durationMin} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Weekly volume (hard sets)</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {program.weeklyVolume.map((v) => (
            <div key={v.muscle} className="rounded-lg border border-zinc-200 bg-white p-3">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-zinc-900">{v.muscle}</span>
                <span className="text-sm text-zinc-500">{v.sets} sets</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{v.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-zinc-900">Workouts</h2>
        {onSwap && answers && (
          <p className="text-xs text-zinc-500">
            Tap <span className="font-medium">Swap</span> on any exercise to remove it and pick a replacement for the same muscle group.
          </p>
        )}
        {program.workouts.map((day) => (
          <div key={day.id}>
            <h3 className="mb-2 text-base font-semibold text-zinc-800">
              {day.focus} <span className="font-normal text-zinc-400">· ~{day.durationMin} min</span>
            </h3>
            <TrackerTable day={day} answers={answers} onSwap={onSwap} />
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Progression system</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-700">
          {program.progression.map((p, i) => (
            <li key={i} className={p.match(/^\d\./) ? "font-medium text-zinc-900" : ""}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Deload / recovery</h2>
        <p className="text-sm leading-relaxed text-zinc-700"><strong>When:</strong> {program.deload.when}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
          {program.deload.how.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Warm-up</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
          {program.warmup.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Cardio</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
          {program.cardio.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Core</h2>
        <p className="text-sm leading-relaxed text-zinc-700">{program.core}</p>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Substitutions</h2>
        <ul className="space-y-1 text-sm text-zinc-700">
          {program.substitutions.map((s, i) => (
            <li key={i}><span className="text-zinc-500">{s.from}</span> → <span className="text-zinc-900">{s.to}</span></li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">12-week framework</h2>
        <div className="space-y-2">
          {program.twelveWeek.map((t) => (
            <div key={t.weeks} className="flex gap-3 text-sm">
              <span className="w-16 shrink-0 font-semibold text-zinc-900">Wk {t.weeks}</span>
              <span className="text-zinc-700">{t.focus}</span>
            </div>
          ))}
        </div>
      </section>

      {onReset && (
        <button
          onClick={onReset}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900"
        >
          ← Edit answers
        </button>
      )}
    </div>
  );
}