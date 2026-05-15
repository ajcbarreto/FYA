import type { Locale } from "@/lib/i18n/config";

type NavbarSkeletonProps = {
  locale: Locale;
};

export function NavbarSkeleton({ locale }: NavbarSkeletonProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="text-2xl font-black tracking-tight text-primary">FYA</div>
        <div className="hidden items-center gap-4 md:flex">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex h-10 items-center rounded-full border border-border/60 bg-muted/60 p-1 text-xs font-bold">
            <span
              className={`rounded-full px-3 py-1.5 ${locale === "pt" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
            >
              PT
            </span>
            <span
              className={`rounded-full px-3 py-1.5 ${locale === "en" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
            >
              EN
            </span>
          </div>
          <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      </nav>
    </header>
  );
}
