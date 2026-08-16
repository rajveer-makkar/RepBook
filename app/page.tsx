"use client";

import { useEffect, useState } from "react";
import Questionnaire from "@/components/Questionnaire";
import Results from "@/components/Results";
import { buildProgram } from "@/lib/engine";
import type { Answers, Program } from "@/lib/types";

const STORAGE_KEY = "workout-answers";

export default function Home() {
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [aiRationale, setAiRationale] = useState<string | undefined>();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | undefined>();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const timer = setTimeout(() => {
      if (raw) {
        try {
          setAnswers(JSON.parse(raw));
        } catch {
          /* ignore */
        }
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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

  const reset = () => setProgram(null);

  return (
    <main className="min-h-screen bg-zinc-50 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Workout Program Builder
          </h1>
          <p className="mt-1 text-zinc-600">
            Answer 9 short sections — get a personalized hypertrophy / recomp program with
            tracker tables, progression rules, and deload guidance.
          </p>
        </header>

        {!program ? (
          <Questionnaire key={hydrated ? "ready" : "loading"} onGenerate={generate} initial={answers ?? undefined} />
        ) : (
          <Results
            program={program}
            aiRationale={aiRationale}
            aiLoading={aiLoading}
            aiError={aiError}
            onEnhance={enhance}
            onReset={reset}
          />
        )}
      </div>
    </main>
  );
}