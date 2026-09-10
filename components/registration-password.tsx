"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

export function RegistrationPassword({
  locale,
  className,
}: {
  locale: Locale;
  className: string;
}) {
  const [visible, setVisible] = useState(false);
  const label = visible
    ? locale === "pt"
      ? "Ocultar palavra-passe"
      : "Hide password"
    : locale === "pt"
      ? "Mostrar palavra-passe"
      : "Show password";

  return (
    <div className="relative">
      <input
        id="password"
        name="password"
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        minLength={6}
        required
        className={className}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={label}
        aria-controls="password"
        className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="h-5 w-5" />
        ) : (
          <Eye aria-hidden="true" className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
