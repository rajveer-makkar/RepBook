import { SkeletonCard, SkeletonList, Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Sk className="h-7 w-44" />
        <Sk className="h-8 w-20 rounded-lg" />
      </div>
      <SkeletonCard />
      <SkeletonList rows={6} />
    </div>
  );
}