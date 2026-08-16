import { SkeletonList, Sk } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Sk className="h-7 w-36" />
      <SkeletonList rows={3} />
    </div>
  );
}