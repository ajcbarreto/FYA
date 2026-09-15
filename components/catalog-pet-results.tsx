import Link from "next/link";
import { PawPrint, X } from "lucide-react";
import { redirect } from "next/navigation";
import { PetCard } from "@/components/pet-card";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/get-user";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCatalogPets, getCatalogPetsCount } from "@/lib/pet-catalog/db-pets";
import { getFavoriteAnimalIds } from "@/lib/favorites/db";
import type { Locale } from "@/lib/i18n/config";
import { loadPaginatedData } from "@/lib/pagination";

type CatalogSelect = {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

type CatalogPetResultsProps = {
  locale: Locale;
  options: {
    search: string;
    location: string;
    species: string;
    sex: string;
    size: string;
    age: string;
    compatibility: string;
  };
  urlParamsString: string;
  requestedPage: string;
  selects: CatalogSelect[];
};

export async function CatalogPetResults({
  locale,
  options,
  urlParamsString,
  requestedPage,
  selects,
}: CatalogPetResultsProps) {
  const pt = locale === "pt";
  const urlParams = new URLSearchParams(urlParamsString);
  const href = (page: number) => {
    const params = new URLSearchParams(urlParams);
    if (page > 1) params.set("page", String(page));
    return `/${locale}/pets${params.size ? `?${params}` : ""}`;
  };

  if (!hasSupabaseEnv) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const [result, favorites] = await Promise.all([
    loadPaginatedData({
      requestedPage,
      pageSize: 16,
      count: () => getCatalogPetsCount(supabase, options),
      load: (page) =>
        getCatalogPets(supabase, locale, { ...options, limit: 16, page }),
    }),
    getAuthUser().then(({ user }) =>
      user ? getFavoriteAnimalIds(supabase, user.id) : new Set<string>(),
    ),
  ]);
  if (result.redirectPage !== null) redirect(href(result.redirectPage));
  const { total, pages, page, items: pets } = result;

  const active = Array.from(urlParams.entries());
  const pageNumbers = Array.from(new Set([1, page - 1, page, page + 1, pages]))
    .filter((n) => n > 0 && n <= pages)
    .sort((a, b) => a - b);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          {total}{" "}
          {pt
            ? total === 1
              ? "animal encontrado"
              : "animais encontrados"
            : total === 1
              ? "animal found"
              : "animals found"}
        </p>
        <div className="flex flex-wrap gap-2">
          {active.map(([key, value]) => {
            const params = new URLSearchParams(urlParams);
            params.delete(key);
            const label =
              selects
                .find((select) => select.name === key)
                ?.options.find((option) => option.value === value)?.label ??
              value;
            return (
              <Link
                key={key}
                href={`/${locale}/pets?${params}`}
                className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs"
                aria-label={`${pt ? "Remover" : "Remove"} ${label}`}
              >
                {label}
                <X className="size-3" />
              </Link>
            );
          })}
        </div>
      </div>

      {pets.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              locale={locale}
              isFavorite={favorites.has(pet.id)}
              returnTo={href(page)}
            />
          ))}
        </div>
      ) : (
        <div className="surface py-16 text-center">
          <PawPrint className="mx-auto mb-5 size-10 text-secondary" />
          <h2 className="text-2xl font-semibold">
            {pt
              ? "Ainda não encontrámos esse amigo."
              : "We haven't found that friend yet."}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {pt
              ? "Experimenta uma pesquisa mais ampla ou remove alguns filtros."
              : "Try a broader search or remove a few filters."}
          </p>
          {active.length > 0 && (
            <Link href={`/${locale}/pets`} className="button-secondary mt-6">
              {pt ? "Limpar filtros" : "Clear filters"}
            </Link>
          )}
        </div>
      )}

      {pages > 1 && (
        <nav
          aria-label={pt ? "Paginação" : "Pagination"}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {page > 1 && (
            <Link href={href(page - 1)} className="button-secondary">
              {pt ? "Anterior" : "Previous"}
            </Link>
          )}
          {pageNumbers.map((n) => (
            <Link
              key={n}
              href={href(n)}
              aria-current={n === page ? "page" : undefined}
              className={n === page ? "button-primary" : "button-secondary"}
            >
              {n}
            </Link>
          ))}
          {page < pages && (
            <Link href={href(page + 1)} className="button-secondary">
              {pt ? "Seguinte" : "Next"}
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
