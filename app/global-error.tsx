"use client";

import { useEffect } from "react";
import { defaultLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = getDictionary(defaultLocale).errors;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={defaultLocale}>
      <body className="min-h-screen antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-6 px-6 py-16 text-center lg:px-8">
          <p className="text-2xl font-black text-primary">FYA</p>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">{t.title}</h1>
            <p className="max-w-md text-sm text-muted-foreground">{t.description}</p>
          </div>
          <button
            onClick={reset}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            {t.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
