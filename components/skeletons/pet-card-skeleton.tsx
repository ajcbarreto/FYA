import { SketchSkeleton } from "@/components/ui/sketch-skeleton";

type PetCardSkeletonProps = {
  index?: number;
};

export function PetCardSkeleton({ index = 0 }: PetCardSkeletonProps) {
  const delay = index * 80;

  return (
    <article className="pet-card overflow-hidden">
      <div className="relative aspect-[5/4] bg-muted/20">
        <SketchSkeleton
          className="absolute inset-0 rounded-none border-0"
          delay={delay}
        />
        <SketchSkeleton
          className="absolute bottom-3 left-3 h-6 w-16 rounded-full"
          delay={delay + 40}
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <SketchSkeleton className="h-6 w-[45%]" delay={delay + 60} />
          <SketchSkeleton className="size-4 shrink-0 rounded-sm" delay={delay + 80} />
        </div>
        <SketchSkeleton className="h-4 w-[62%]" delay={delay + 100} />
        <div className="border-t border-border/40 pt-3">
          <SketchSkeleton className="h-3 w-[38%]" delay={delay + 120} />
        </div>
      </div>
    </article>
  );
}

export function PetCardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <PetCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}
