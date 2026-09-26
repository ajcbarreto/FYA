import { SketchSkeleton } from "@/components/ui/sketch-skeleton";
import { PetCardGridSkeleton } from "@/components/skeletons/pet-card-skeleton";
import type { Locale } from "@/lib/i18n/config";

export function ShelterDetailBodySkeleton({ locale }: { locale: Locale }) {
  const pt = locale === "pt";

  return (
    <div
      aria-busy="true"
      aria-label={pt ? "A carregar canil" : "Loading shelter"}
    >
      <div className="overflow-hidden rounded-3xl bg-primary/10 p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <SketchSkeleton className="size-20 rounded-2xl" />
          <div className="w-full min-w-0 flex-1 space-y-3">
            <SketchSkeleton className="h-10 w-2/5" />
            <SketchSkeleton className="h-4 w-1/4" delay={40} />
            <SketchSkeleton className="h-4 w-1/3" delay={80} />
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <SketchSkeleton className="h-11 w-40 rounded-full" />
          <SketchSkeleton className="h-11 w-32 rounded-full" delay={40} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-3xl border border-border/20 bg-card p-6">
            <SketchSkeleton className="h-6 w-32" />
            <SketchSkeleton className="mt-4 h-4 w-full" delay={40} />
            <SketchSkeleton className="mt-2 h-4 w-4/5" delay={80} />
            <div className="mt-6 grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, index) => (
                <SketchSkeleton
                  key={index}
                  className="h-20 rounded-2xl"
                  delay={index * 50}
                />
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/20 bg-card p-6">
            <SketchSkeleton className="h-6 w-48" />
            <div className="mt-4">
              <PetCardGridSkeleton count={3} />
            </div>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-4">
          <SketchSkeleton className="h-64 w-full rounded-3xl" />
          <SketchSkeleton className="h-48 w-full rounded-3xl" delay={60} />
        </div>
      </div>
    </div>
  );
}

export function ShelterDetailSkeleton({ locale }: { locale: Locale }) {
  const pt = locale === "pt";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-7xl flex-1 px-5 pb-16 pt-8 sm:px-8"
      aria-busy="true"
      aria-label={pt ? "A carregar canil" : "Loading shelter"}
    >
      <SketchSkeleton className="mb-6 h-4 w-32" />
      <ShelterDetailBodySkeleton locale={locale} />
    </main>
  );
}
