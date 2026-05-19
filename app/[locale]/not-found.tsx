"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function LocaleNotFound() {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  const locale = isLocale(segment) ? segment : defaultLocale;
  const t = getDictionary(locale).errors;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center lg:px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <PawPrint className="size-7" aria-hidden />
      </div>
      <div className="space-y-2">
        <p className="text-4xl font-black text-primary">404</p>
        <h1 className="text-xl font-bold">{t.notFoundTitle}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{t.notFoundDescription}</p>
      </div>
      <Button asChild>
        <Link href={`/${locale}`}>{t.backHome}</Link>
      </Button>
    </main>
  );
}
