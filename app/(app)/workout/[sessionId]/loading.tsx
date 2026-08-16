import { Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Sk className="h-4 w-16" />
      <div className="flex items-center justify-between">
        <div>
          <Sk className="h-6 w-40" />
          <Sk className="mt-2 h-3 w-32" />
        </div>
        <Sk className="h-9 w-28 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <Sk className="mb-3 h-4 w-2/3" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Sk className="h-10 flex-1 rounded-lg" />
                  <Sk className="h-10 flex-1 rounded-lg" />
                  <Sk className="h-10 w-14 rounded-lg" />
                  <Sk className="h-10 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}