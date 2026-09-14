import { SketchSkeleton } from "@/components/ui/sketch-skeleton";
import { PetCardGridSkeleton } from "@/components/skeletons/pet-card-skeleton";
import type { Locale } from "@/lib/i18n/config";

export function CatalogPageSkeleton({ locale }: { locale: Locale }) {
  const pt = locale === "pt";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-shell"
      aria-busy="true"
      aria-label={pt ? "A carregar catálogo" : "Loading catalog"}
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <SketchSkeleton className="hidden h-3 w-40 sm:block" />
          <SketchSkeleton className="h-9 w-56 sm:h-10 sm:w-72" />
          <SketchSkeleton className="h-4 w-full max-w-md" />
        </div>
        <SketchSkeleton className="h-11 w-40 rounded-xl" />
      </header>

      <div className="surface mb-8 space-y-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <SketchSkeleton className="h-12 w-full rounded-xl" />
          <SketchSkeleton className="h-12 w-full rounded-xl" />
          <SketchSkeleton className="h-12 w-full rounded-xl sm:w-36" />
        </div>
        <div className="flex flex-wrap gap-3 border-t border-border/40 pt-4">
          {Array.from({ length: 5 }, (_, index) => (
            <SketchSkeleton
              key={index}
              className="h-12 min-w-[125px] flex-1 rounded-xl"
              delay={index * 60}
            />
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <SketchSkeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <SketchSkeleton className="h-8 w-8 rounded-lg" />
          <SketchSkeleton className="h-8 w-8 rounded-lg" delay={40} />
          <SketchSkeleton className="h-8 w-8 rounded-lg" delay={80} />
        </div>
      </div>

      <PetCardGridSkeleton count={8} />
    </main>
  );
}
