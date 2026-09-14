import { SketchSkeleton } from "@/components/ui/sketch-skeleton";
import { PetCardGridSkeleton } from "@/components/skeletons/pet-card-skeleton";
import type { Locale } from "@/lib/i18n/config";

export function HomePageSkeleton({ locale }: { locale: Locale }) {
  const pt = locale === "pt";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      aria-busy="true"
      aria-label={pt ? "A carregar página inicial" : "Loading home page"}
    >
      <section className="page-shell grid items-center gap-10 pb-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-20">
        <div className="space-y-6 py-4 lg:py-10">
          <SketchSkeleton className="h-4 w-44 rounded-full" />
          <div className="space-y-3">
            <SketchSkeleton className="h-14 w-full max-w-lg" />
            <SketchSkeleton className="h-14 w-[85%] max-w-md" />
          </div>
          <SketchSkeleton className="h-16 w-full max-w-lg rounded-2xl" />
          <div className="flex flex-wrap gap-2">
            <SketchSkeleton className="h-9 w-24 rounded-full" />
            <SketchSkeleton className="h-9 w-20 rounded-full" delay={60} />
            <SketchSkeleton className="h-9 w-28 rounded-full" delay={120} />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl pb-5">
          <SketchSkeleton className="aspect-[.95] w-full rounded-[45%_45%_12%_12%]" />
          <SketchSkeleton className="absolute right-0 top-5 size-20 rounded-full" delay={80} />
          <SketchSkeleton className="absolute -left-2 bottom-6 h-20 w-[85%] rounded-2xl sm:-left-6" delay={160} />
        </div>
      </section>

      <section className="border-y border-border/50 bg-muted/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-8 py-6">
          {Array.from({ length: 3 }, (_, index) => (
            <SketchSkeleton
              key={index}
              className="h-4 w-44 sm:w-52"
              delay={index * 70}
            />
          ))}
        </div>
      </section>

      <section className="page-shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div className="space-y-3">
            <SketchSkeleton className="h-3 w-36" />
            <SketchSkeleton className="h-10 w-64 sm:h-12 sm:w-80" />
          </div>
          <SketchSkeleton className="h-11 w-36 rounded-xl" />
        </div>
        <PetCardGridSkeleton count={4} />
      </section>
    </main>
  );
}
