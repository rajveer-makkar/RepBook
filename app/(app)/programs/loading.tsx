import { SkeletonHeader, SkeletonList } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <SkeletonHeader />
      <SkeletonList rows={3} />
    </div>
  );
}