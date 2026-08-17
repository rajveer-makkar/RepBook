"use client";

import { useEffect, useState } from "react";
import { persistCompletion } from "@/lib/actions/sessions";
import { getPending, removePending } from "@/lib/queue";

export default function SyncPending() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const flush = async () => {
      const items = getPending();
      setPending(items.length);
      if (items.length === 0 || !navigator.onLine) return;
      setSyncing(true);
      for (const item of items) {
        const res = await persistCompletion(item.sessionId, item.logs, item.feedback);
        if (!res?.error) removePending(item.sessionId);
      }
      setSyncing(false);
      setPending(getPending().length);
    };
    window.addEventListener("online", flush);
    flush();
    return () => window.removeEventListener("online", flush);
  }, []);

  if (pending === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-4">
      <div className="rounded-xl border border-amber-500/30 bg-zinc-900/95 px-4 py-2.5 text-center text-xs font-medium text-amber-300 backdrop-blur">
        {syncing
          ? "Syncing saved workout…"
          : `${pending} saved workout${pending === 1 ? "" : "s"} waiting to sync`}
      </div>
    </div>
  );
}