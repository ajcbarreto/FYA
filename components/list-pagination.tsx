import Link from "next/link";
export function ListPagination({
  page,
  total,
  base,
  locale,
}: {
  page: number;
  total: number;
  base: string;
  locale: string;
}) {
  const pages = Math.max(1, Math.ceil(total / 25));
  if (pages === 1) return null;
  return (
    <nav
      aria-label={locale === "pt" ? "Paginação" : "Pagination"}
      className="my-5 flex items-center justify-center gap-3 text-xs"
    >
      {page > 1 && (
        <Link
          className="rounded-full border border-border px-3 py-2"
          href={`${base}?page=${page - 1}`}
        >
          {locale === "pt" ? "Anterior" : "Previous"}
        </Link>
      )}
      <span>
        {page} / {pages}
      </span>
      {page < pages && (
        <Link
          className="rounded-full border border-border px-3 py-2"
          href={`${base}?page=${page + 1}`}
        >
          {locale === "pt" ? "Seguinte" : "Next"}
        </Link>
      )}
    </nav>
  );
}
