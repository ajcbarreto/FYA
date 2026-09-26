"use client";
export function PrintButton({ locale }: { locale: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
    >
      {locale === "pt" ? "Imprimir / guardar PDF" : "Print / save PDF"}
    </button>
  );
}
