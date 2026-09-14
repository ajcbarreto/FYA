import { SketchSkeleton } from "@/components/ui/sketch-skeleton";
import { PetCardGridSkeleton } from "@/components/skeletons/pet-card-skeleton";
import type { Locale } from "@/lib/i18n/config";

export function PetDetailBodySkeleton({ locale }: { locale: Locale }) {
  const pt = locale === "pt";

  return (
    <div
      aria-busy="true"
      aria-label={pt ? "A carregar detalhes do pet" : "Loading pet details"}
    >
      <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
        <div className="space-y-7">
          <SketchSkeleton className="aspect-[5/4] w-full rounded-[2rem]" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <SketchSkeleton
                key={index}
                className="aspect-square rounded-2xl"
                delay={index * 50}
              />
            ))}
          </div>
          <div className="space-y-3">
            <SketchSkeleton className="h-6 w-2/5" />
            <SketchSkeleton className="h-4 w-full" delay={40} />
            <SketchSkeleton className="h-4 w-full" delay={80} />
            <SketchSkeleton className="h-4 w-4/5" delay={120} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <SketchSkeleton className="h-10 w-3/5" />
            <SketchSkeleton className="h-4 w-2/5" delay={40} />
          </div>
          <div className="surface space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <SketchSkeleton className="h-3 w-24" delay={index * 40} />
                <SketchSkeleton className="h-4 w-20" delay={index * 40 + 20} />
              </div>
            ))}
          </div>
          <SketchSkeleton className="h-32 w-full rounded-2xl" />
          <SketchSkeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>

      <section className="mt-16 space-y-6">
        <SketchSkeleton className="h-8 w-48" />
        <PetCardGridSkeleton count={3} />
      </section>
    </div>
  );
}

export function PetDetailSkeleton({ locale }: { locale: Locale }) {
  const pt = locale === "pt";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-shell"
      aria-busy="true"
      aria-label={pt ? "A carregar detalhes do pet" : "Loading pet details"}
    >
      <SketchSkeleton className="mb-7 h-4 w-36" />
      <PetDetailBodySkeleton locale={locale} />
    </main>
  );
}
