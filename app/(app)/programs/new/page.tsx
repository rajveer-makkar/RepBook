"use client";

import { useState } from "react";
import Link from "next/link";
import Questionnaire from "@/components/Questionnaire";
import Results from "@/components/Results";
import { buildProgram } from "@/lib/engine";
import type { Answers, Program } from "@/lib/types";

const STORAGE_KEY = "workout-answers";

export default function NewProgramPage() {
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [aiRationale, setAiRationale] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | undefined>();

  const generate = (a: Answers) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
    } catch {
      /* ignore */
    }
    setAnswers(a);
    setProgram(buildProgram(a));
    setAiRationale(undefined);
    setAiError(undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (!program) {
    return (
      <div className="space-y-4">
        <Link href="/programs" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
          ← Back to programs
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Build your program</h1>
        <Questionnaire onGenerate={generate} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/programs" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
        ← Back to programs
      </Link>
      <Results
        program={program}
        aiRationale={aiRationale}
        aiLoading={aiLoading}
        aiError={aiError}
        onEnhance={enhance}
        onReset={() => setProgram(null)}
      />
    </div>
  );
}