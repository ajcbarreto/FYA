"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  const locale = isLocale(segment) ? segment : defaultLocale;
  const t = getDictionary(locale).errors;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center lg:px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-bold">{t.title}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{t.description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>{t.retry}</Button>
        <Button asChild variant="outline">
          <Link href={`/${locale}`}>{t.backHome}</Link>
        </Button>
      </div>
    </main>
  );
}
