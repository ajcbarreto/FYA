import { SketchSkeleton } from "@/components/ui/sketch-skeleton";
import type { Locale } from "@/lib/i18n/config";

export function DashboardPageSkeleton({ locale }: { locale: Locale }) {
  const pt = locale === "pt";

  return (
    <div
      className="flex min-w-0 flex-1 flex-col gap-6"
      role="status"
      aria-busy="true"
      aria-label={pt ? "A carregar painel" : "Loading dashboard"}
    >
      <div className="space-y-3">
        <SketchSkeleton className="h-8 w-56 max-w-full" />
        <SketchSkeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="surface space-y-3">
            <SketchSkeleton className="h-3 w-24" delay={index * 60} />
            <SketchSkeleton className="h-8 w-16" delay={index * 60 + 40} />
            <SketchSkeleton className="h-3 w-32" delay={index * 60 + 80} />
          </div>
        ))}
      </div>

      <div className="surface space-y-4">
        <SketchSkeleton className="h-5 w-40" />
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-t border-border/40 pt-4"
          >
            <SketchSkeleton
              className="size-12 rounded-2xl"
              delay={index * 50}
            />
            <div className="flex-1 space-y-2">
              <SketchSkeleton className="h-4 w-2/5" delay={index * 50 + 20} />
              <SketchSkeleton className="h-3 w-3/5" delay={index * 50 + 40} />
            </div>
            <SketchSkeleton
              className="h-8 w-20 rounded-lg"
              delay={index * 50 + 60}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
