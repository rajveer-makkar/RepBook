import { Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Sk className="h-7 w-24" />
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <Sk className="mb-3 h-4 w-36" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <Sk key={i} className="h-8 rounded" />
          ))}
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <Sk className="mb-2 h-4 w-2/3" />
          <Sk className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}