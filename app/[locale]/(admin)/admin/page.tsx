import { notFound } from "next/navigation";
import { updatePetCatalogFilters } from "@/app/[locale]/(admin)/admin/actions";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPetCatalogFiltersConfig } from "@/lib/pet-catalog/filter-config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const { locale } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const filterConfig = await getPetCatalogFiltersConfig(supabase);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold">{dictionary.admin.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dictionary.admin.subtitle}</p>

      {success && (
        <p className="mt-4 rounded-md border border-secondary/35 bg-secondary/15 px-3 py-2 text-sm text-secondary">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{dictionary.admin.filterConfigTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{dictionary.admin.filterConfigDescription}</p>
        <p className="mt-2 text-xs text-muted-foreground">{dictionary.admin.hint}</p>

        <form action={updatePetCatalogFilters} className="mt-6 space-y-4">
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-2">
            <label htmlFor="species" className="text-sm font-medium">
              {dictionary.admin.species}
            </label>
            <input
              id="species"
              name="species"
              defaultValue={filterConfig.species.join(", ")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ageRanges" className="text-sm font-medium">
              {dictionary.admin.ageRanges}
            </label>
            <input
              id="ageRanges"
              name="ageRanges"
              defaultValue={filterConfig.ageRanges.join(", ")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sizes" className="text-sm font-medium">
              {dictionary.admin.sizes}
            </label>
            <input
              id="sizes"
              name="sizes"
              defaultValue={filterConfig.sizes.join(", ")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="genders" className="text-sm font-medium">
              {dictionary.admin.genders}
            </label>
            <input
              id="genders"
              name="genders"
              defaultValue={filterConfig.genders.join(", ")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="compatibilities" className="text-sm font-medium">
              {dictionary.admin.compatibilities}
            </label>
            <input
              id="compatibilities"
              name="compatibilities"
              defaultValue={filterConfig.compatibilities.join(", ")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <button type="submit" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">
            {dictionary.admin.save}
          </button>
        </form>
      </section>
    </main>
  );
}
