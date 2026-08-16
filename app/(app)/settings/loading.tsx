import { SkeletonList, Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Sk className="h-7 w-40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <Sk className="mb-2 h-4 w-1/2" />
          <Sk className="h-3 w-1/3" />
        </div>
      ))}
      <SkeletonList rows={2} />
    </div>
  );
}