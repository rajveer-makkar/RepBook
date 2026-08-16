import { cn } from "@/lib/cn";

export function Sk({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-zinc-800", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-zinc-800 bg-zinc-900 p-5", className)}>
      <Sk className="mb-2 h-3 w-24" />
      <Sk className="h-5 w-3/4" />
    </div>
  );
}

export function SkeletonList({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <Sk className="mb-2 h-4 w-1/2" />
          <Sk className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between">
      <Sk className="h-7 w-36" />
      <Sk className="h-8 w-16 rounded-lg" />
    </div>
  );
}