import { SkeletonHeader, SkeletonCard } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <SkeletonHeader />
      <SkeletonCard className="h-44" />
      <SkeletonCard className="h-44" />
    </div>
  );
}