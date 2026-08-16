"use client";

import { useState } from "react";
import type { Program } from "@/lib/types";

interface Props {
  program: Program;
  aiRationale?: string;
  aiLoading?: boolean;
  aiError?: string;
  onEnhance?: () => void;
  onReset: () => void;
}

function TrackerTable({ day }: { day: Program["workouts"][number] }) {
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
              <td className="px-3 py-2 font-medium text-zinc-900">{e.name}</td>
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

export default function Results({ program, aiRationale, aiLoading, aiError, onEnhance, onReset }: Props) {
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
          <button
            onClick={copyAll}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            {copied ? "Copied!" : "Copy full program"}
          </button>
        </div>
      </div>

      {aiError && <p className="text-sm text-red-600">{aiError}</p>}
      <p className="text-sm leading-relaxed text-zinc-700">{rationale}</p>

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
        {program.workouts.map((day) => (
          <div key={day.id}>
            <h3 className="mb-2 text-base font-semibold text-zinc-800">
              {day.focus} <span className="font-normal text-zinc-400">· ~{day.durationMin} min</span>
            </h3>
            <TrackerTable day={day} />
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

      <button
        onClick={onReset}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900"
      >
        ← Edit answers
      </button>
    </div>
  );
}