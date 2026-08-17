"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Questionnaire from "@/components/Questionnaire";
import Results from "@/components/Results";
import { buildProgram } from "@/lib/engine";
import { toSummary } from "@/lib/adaptive";
import { updateProgram } from "@/lib/actions/programs";
import type { Answers, ExerciseSwap, Program } from "@/lib/types";
import type { FeedbackProp } from "@/lib/adaptive";

interface Props {
  programId: string;
  initialName: string;
  initialAnswers: Answers;
  feedback?: FeedbackProp | null;
}

export default function ProgramEditor({ programId, initialName, initialAnswers, feedback }: Props) {
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
    setAnswers(a);
    setProgram(buildProgram(a, summary));
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
    const res = await updateProgram(programId, name, answers, aiRationale || program.rationale, summary);
    setSaving(false);
    if (res.ok) router.push(`/programs/${programId}`);
    else setSaveError(res.error || "Failed to save.");
  };

  if (!program) {
    return (
      <div className="space-y-4">
        <Link href={`/programs/${programId}`} className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
          ← Back to program
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">Edit program</h1>
        <p className="text-sm text-zinc-400">
          Your answers are pre-filled. Adjust and regenerate — this overwrites the saved program.
        </p>
        <Questionnaire onGenerate={generate} initial={initialAnswers} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href={`/programs/${programId}`} className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
        ← Back to program
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
        defaultName={initialName}
      />
    </div>
  );
}