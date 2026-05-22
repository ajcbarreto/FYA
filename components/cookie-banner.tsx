"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type CookieBannerProps = {
  locale: Locale;
};

const STORAGE_KEY = "fya-cookies-accepted";

function subscribeToStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readAcceptedFlag(): "1" | "0" {
  if (typeof window === "undefined") return "1";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1" ? "1" : "0";
  } catch {
    // Browsers em modo privado podem bloquear localStorage — assumimos
    // aceite para nao mostrar o banner indefinidamente.
    return "1";
  }
}

// Banner curto explicando que so usamos cookies funcionais. Persiste a
// dispensa em localStorage para nao reaparecer em cada navegacao.
export function CookieBanner({ locale }: CookieBannerProps) {
  const flag = useSyncExternalStore(
    subscribeToStorage,
    readAcceptedFlag,
    () => "1" as const,
  );
  const t = getDictionary(locale).legal;

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
      // Dispara o evento para outros tabs e para o nosso subscribe.
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: "1" }));
    } catch {
      // ignore
    }
  }

  if (flag === "1") return null;

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-40 flex justify-center sm:bottom-6">
      <div className="pointer-events-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-border/40 bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center">
        <Cookie className="hidden h-5 w-5 shrink-0 text-primary sm:block" aria-hidden />
        <p className="flex-1 text-xs text-muted-foreground">
          {t.cookieBannerText}{" "}
          <Link href={`/${locale}/privacidade`} className="font-semibold text-primary underline-offset-2 hover:underline">
            {t.cookieBannerLearnMore}
          </Link>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.cookieBannerAccept}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.cookieBannerAccept}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
