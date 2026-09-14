import { SketchSkeleton } from "@/components/ui/sketch-skeleton";
import type { Locale } from "@/lib/i18n/config";

export function GenericPageSkeleton({ locale }: { locale: Locale }) {
  const pt = locale === "pt";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-shell"
      aria-busy="true"
      aria-label={pt ? "A carregar página" : "Loading page"}
    >
      <div className="mb-8 space-y-3">
        <SketchSkeleton className="h-3 w-32" />
        <SketchSkeleton className="h-10 w-64 max-w-full" delay={40} />
        <SketchSkeleton className="h-4 w-full max-w-xl" delay={80} />
      </div>

      <div className="surface space-y-4">
        <SketchSkeleton className="h-5 w-2/5" />
        <SketchSkeleton className="h-4 w-full" delay={40} />
        <SketchSkeleton className="h-4 w-full" delay={80} />
        <SketchSkeleton className="h-4 w-3/4" delay={120} />
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
          <SketchSkeleton className="h-24 rounded-2xl" delay={160} />
          <SketchSkeleton className="h-24 rounded-2xl" delay={200} />
        </div>
      </div>
    </main>
  );
}
