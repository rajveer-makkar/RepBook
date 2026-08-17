"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit02Icon } from "hugeicons-react";
import { renameProgram } from "@/lib/actions/programs";
import { tap } from "@/lib/tap";

export default function RenameProgram({ programId, name }: { programId: string; name: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const res = await renameProgram(programId, value);
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        aria-label="Rename program"
        onClick={() => {
          tap();
          setEditing(true);
        }}
        className="rounded-md p-1 text-zinc-500 transition hover:text-zinc-100"
      >
        <Edit02Icon size={16} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-40 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-zinc-500"
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-900 disabled:opacity-50"
      >
        {saving ? "…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-md px-1 text-xs text-zinc-500 hover:text-zinc-100"
      >
        ✕
      </button>
    </div>
  );
}