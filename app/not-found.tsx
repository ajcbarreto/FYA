import Link from "next/link";
import { defaultLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function RootNotFound() {
  const t = getDictionary(defaultLocale).errors;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center lg:px-8">
      <p className="text-4xl font-black text-primary">404</p>
      <div className="space-y-2">
        <h1 className="text-xl font-bold">{t.notFoundTitle}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{t.notFoundDescription}</p>
      </div>
      <Link
        href={`/${defaultLocale}`}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        {t.backHome}
      </Link>
    </main>
  );
}
