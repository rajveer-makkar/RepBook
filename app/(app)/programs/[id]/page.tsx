import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, name, split_label, rationale, answers")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!program) notFound();

  return (
    <div className="space-y-4">
      <Link href="/programs" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
        ← Back to programs
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900">{program.name}</h1>
      <p className="text-sm text-zinc-500">{program.split_label}</p>
      {program.rationale && <p className="text-sm leading-relaxed text-zinc-700">{program.rationale}</p>}
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
        Workout tracking views land in the next build phase.
      </div>
    </div>
  );
}