import Link from "next/link";
import { notFound } from "next/navigation";
import StickyHeader from "@/components/StickyHeader";
import ProgramSwapper from "@/components/ProgramSwapper";
import { buildProgram } from "@/lib/engine";
import { deleteProgram, setActiveProgram } from "@/lib/actions/programs";
import { createClient, getUser } from "@/lib/supabase/server";
import type { Answers } from "@/lib/types";

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, name, split_label, rationale, answers, is_active")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!program) notFound();

  const generated = buildProgram(program.answers as Parameters<typeof buildProgram>[0]);
  const title = program.split_label || generated.title;

  return (
    <div className="space-y-4">
      <StickyHeader>
        <Link href="/programs" className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
          ← Back to programs
        </Link>
      </StickyHeader>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{program.name}</h1>
          <p className="text-sm text-zinc-400">{title}</p>
        </div>
        <div className="flex gap-2">
          {!program.is_active ? (
            <form action={setActiveProgram.bind(null, id)}>
              <button
                type="submit"
                className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
              >
                Make active
              </button>
            </form>
          ) : (
            <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900">
              Active
            </span>
          )}
          <form action={deleteProgram.bind(null, id)}>
            <button
              type="submit"
              className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <ProgramSwapper
        programId={id}
        program={{ ...generated, title, rationale: program.rationale || generated.rationale }}
        answers={program.answers as Answers}
      />
    </div>
  );
}