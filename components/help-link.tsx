import Link from "next/link";
export function HelpLink({ locale, guide }: { locale: string; guide: string }) {
  return (
    <Link
      href={`/${locale}/ajuda/${guide}`}
      className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold"
    >
      {locale === "pt" ? "Como usar esta página" : "How to use this page"} ↗
    </Link>
  );
}
