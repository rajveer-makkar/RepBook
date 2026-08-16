import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProgramsPage() {
  const supabase = await createClient();

  const { data: programs } = await supabase
    .from("programs")
    .select("id, name, split_label, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Programs</h1>
        <Link
          href="/programs/new"
          className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
        >
          + New
        </Link>
      </div>

      {!programs || programs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center">
          <p className="text-sm text-zinc-400">No programs yet.</p>
          <Link href="/programs/new" className="mt-2 inline-block text-sm font-medium text-zinc-100 underline">
            Build your first program
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <Link
              key={p.id}
              href={`/programs/${p.id}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-500"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-zinc-100">{p.name}</p>
                {p.is_active && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-900">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-zinc-400">{p.split_label || "Program"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}