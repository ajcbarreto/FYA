import { SketchSkeleton } from "@/components/ui/sketch-skeleton";
import { PetCardGridSkeleton } from "@/components/skeletons/pet-card-skeleton";

export function CatalogResultsSkeleton() {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <SketchSkeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <SketchSkeleton className="h-8 w-20 rounded-full" />
          <SketchSkeleton className="h-8 w-20 rounded-full" delay={40} />
        </div>
      </div>
      <PetCardGridSkeleton count={8} />
    </>
  );
}
