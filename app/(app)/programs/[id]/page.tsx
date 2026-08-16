import Link from "next/link";
import { notFound } from "next/navigation";
import Results from "@/components/Results";
import { buildProgram } from "@/lib/engine";
import { deleteProgram, setActiveProgram } from "@/lib/actions/programs";
import { createClient, getUser } from "@/lib/supabase/server";

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
      <Link href="/programs" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
        ← Back to programs
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">{program.name}</h1>
          <p className="text-sm text-zinc-500">{title}</p>
        </div>
        <div className="flex gap-2">
          {!program.is_active ? (
            <form action={setActiveProgram.bind(null, id)}>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Make active
              </button>
            </form>
          ) : (
            <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white">
              Active
            </span>
          )}
          <form action={deleteProgram.bind(null, id)}>
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <Results
        program={{ ...generated, title, rationale: program.rationale || generated.rationale }}
      />
    </div>
  );
}