import { cn } from "@/lib/utils";

type SketchSkeletonProps = {
  className?: string;
  delay?: number;
};

export function SketchSkeleton({ className, delay = 0 }: SketchSkeletonProps) {
  return (
    <div
      className={cn("sketch-block", className)}
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden
    />
  );
}
