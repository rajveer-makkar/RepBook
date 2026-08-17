"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Questionnaire from "@/components/Questionnaire";
import Results from "@/components/Results";
import { buildProgram } from "@/lib/engine";
import { toSummary } from "@/lib/adaptive";
import { cacheNutrition } from "@/lib/cache";
import { saveProgram } from "@/lib/actions/programs";
import type { Answers, ExerciseSwap, Program } from "@/lib/types";
import type { FeedbackProp } from "@/lib/adaptive";

const STORAGE_KEY = "workout-answers";

interface Props {
  feedback?: FeedbackProp | null;
}

export default function NewProgramForm({ feedback }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [aiRationale, setAiRationale] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();
  const summary = feedback ? toSummary(feedback) : undefined;

  const generate = (a: Answers) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
    } catch {
      /* ignore */
    }
    setAnswers(a);
    setProgram(buildProgram(a, summary));
    cacheNutrition(a);
    setAiRationale(undefined);
    setAiError(undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSwap = (swap: ExerciseSwap) => {
    if (!answers || !program) return;
    const next: Answers = { ...answers, swaps: [...(answers.swaps ?? []), swap] };
    setAnswers(next);
    setProgram(buildProgram(next, summary));
  };

  const enhance = async () => {
    if (!answers || !program) return;
    setAiLoading(true);
    setAiError(undefined);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.ok) setAiRationale(data.rationale);
      else setAiError(data.error || "AI enhancement failed.");
    } catch {
      setAiError("Could not reach the AI enhancement service.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (name: string) => {
    if (!answers || !program) return;
    setSaving(true);
    setSaveError(undefined);
    const res = await saveProgram(name, answers, aiRationale || program.rationale, summary);
    setSaving(false);
    if (res.ok && res.id) router.push(`/programs/${res.id}`);
    else setSaveError(res.error || "Failed to save.");
  };

  if (!program) {
    return (
      <div className="space-y-4">
        <Link href="/programs" className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
          ← Back to programs
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">Build your program</h1>
        <Questionnaire onGenerate={generate} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/programs" className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
        ← Back to programs
      </Link>
      <Results
        program={program}
        answers={answers ?? undefined}
        onSwap={handleSwap}
        aiRationale={aiRationale}
        aiLoading={aiLoading}
        aiError={aiError}
        onEnhance={enhance}
        onReset={() => setProgram(null)}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
      />
    </div>
  );
}