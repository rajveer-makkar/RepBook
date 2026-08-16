import { SkeletonCard, Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Sk className="h-7 w-40" />
        <Sk className="mt-2 h-4 w-56" />
      </div>
      <SkeletonCard />
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <Sk className="mb-3 h-4 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Sk key={i} className="h-8 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard className="p-4" />
        <SkeletonCard className="p-4" />
      </div>
    </div>
  );
}