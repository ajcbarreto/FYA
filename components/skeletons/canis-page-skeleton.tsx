import { SketchSkeleton } from "@/components/ui/sketch-skeleton";
import type { Locale } from "@/lib/i18n/config";

function ShelterCardSkeleton({ index = 0 }: { index?: number }) {
  const delay = index * 90;

  return (
    <div className="rounded-3xl border border-border/30 bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <SketchSkeleton className="size-12 rounded-full" delay={delay} />
        <SketchSkeleton className="h-6 w-20 rounded-full" delay={delay + 40} />
      </div>
      <SketchSkeleton className="h-6 w-3/5" delay={delay + 60} />
      <SketchSkeleton className="mt-2 h-4 w-2/5" delay={delay + 80} />
      <SketchSkeleton className="mt-3 h-4 w-24" delay={delay + 100} />
      <div className="mt-3 space-y-2">
        <SketchSkeleton className="h-3 w-full" delay={delay + 120} />
        <SketchSkeleton className="h-3 w-4/5" delay={delay + 140} />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <SketchSkeleton className="h-3 w-20" delay={delay + 160} />
        <SketchSkeleton className="h-3 w-16" delay={delay + 180} />
      </div>
    </div>
  );
}

export function CanisPageSkeleton({ locale }: { locale: Locale }) {
  const pt = locale === "pt";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-7xl flex-1 px-6 pb-16 pt-10 lg:px-8"
      aria-busy="true"
      aria-label={pt ? "A carregar canis" : "Loading shelters"}
    >
      <header className="mb-10 space-y-3">
        <SketchSkeleton className="h-10 w-72 max-w-full" />
        <SketchSkeleton className="h-4 w-full max-w-2xl" delay={40} />
      </header>

      <div className="mb-8 flex gap-2">
        <SketchSkeleton className="h-11 flex-1 rounded-full" />
        <SketchSkeleton className="h-11 w-28 rounded-full" delay={60} />
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <ShelterCardSkeleton key={index} index={index} />
        ))}
      </section>
    </main>
  );
}
