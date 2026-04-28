type RouteLoadingProps = {
  title: string;
  subtitle: string;
};

export function RouteLoading({ title, subtitle }: RouteLoadingProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center lg:px-8">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary" aria-hidden />
      <div className="space-y-2">
        <p className="text-xl font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </main>
  );
}
