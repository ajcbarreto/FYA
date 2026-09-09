"use client";
import { useParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const pt = useParams().locale === "pt";
  return (
    <main id="main-content" className="page-shell">
      <div className="surface mx-auto my-12 max-w-lg text-center">
        <h1 className="display-title text-4xl">
          {pt ? "Vamos tentar outra vez." : "Let's try that again."}
        </h1>
        <p className="my-5 text-muted-foreground">
          {pt
            ? "Não conseguimos carregar esta informação. Tenta novamente dentro de instantes."
            : "We couldn't load this information. Please try again in a moment."}
        </p>
        <button onClick={reset} className="button-primary">
          <RefreshCw className="size-4" />
          {pt ? "Tentar novamente" : "Try again"}
        </button>
      </div>
    </main>
  );
}
