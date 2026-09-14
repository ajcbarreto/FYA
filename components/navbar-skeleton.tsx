import { SketchSkeleton } from "@/components/ui/sketch-skeleton";
import type { Locale } from "@/lib/i18n/config";

type NavbarSkeletonProps = {
  locale: Locale;
};

export function NavbarSkeleton({ locale }: NavbarSkeletonProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="text-2xl font-bold tracking-tight text-primary">
          FYA
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <SketchSkeleton className="h-3 w-16 rounded-md" />
          <SketchSkeleton className="h-3 w-20 rounded-md" delay={50} />
          <SketchSkeleton className="h-3 w-24 rounded-md" delay={100} />
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex h-10 items-center rounded-lg border border-border/60 bg-muted/60 p-1 text-xs font-bold">
            <span
              className={`rounded-md px-3 py-1.5 ${locale === "pt" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
            >
              PT
            </span>
            <span
              className={`rounded-md px-3 py-1.5 ${locale === "en" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
            >
              EN
            </span>
          </div>
          <SketchSkeleton className="h-10 w-28 rounded-lg" delay={80} />
        </div>
      </nav>
    </header>
  );
}
