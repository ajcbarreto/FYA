import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getPetCatalogFiltersConfig } from "@/lib/pet-catalog/filter-config";
import { getPlatformSettings } from "@/lib/admin/platform-settings";
import { updatePetCatalogFilters, updatePlatformSettings } from "@/app/[locale]/(admin)/admin/actions";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";

type AdminSettingsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function AdminSettingsPage({ params, searchParams }: AdminSettingsPageProps) {
  const { locale } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const supabase = await createServerSupabaseClient();
  const [filterConfig, platform] = await Promise.all([
    getPetCatalogFiltersConfig(supabase),
    getPlatformSettings(supabase),
  ]);

  const copy = getDictionary(locale).adminSettings;

  const feedback =
    (success && (copy.messages[success] ?? decodeURIComponent(success))) ||
    (error && (copy.messages[error] ?? decodeURIComponent(error))) ||
    null;

  const inputClass =
    "h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <main className="space-y-6">
      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <h2 className="text-lg font-bold">{copy.platformTitle}</h2>
        <form action={updatePlatformSettings} className="mt-4 space-y-5">
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-2">
            <label htmlFor="platformName" className="text-sm font-semibold">
              {copy.platformName}
            </label>
            <input id="platformName" name="platformName" defaultValue={platform.platformName} required className={inputClass} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="contactEmail" className="text-sm font-semibold">
                {copy.contactEmail}
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={platform.contactEmail}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="supportEmail" className="text-sm font-semibold">
                {copy.supportEmail}
              </label>
              <input
                id="supportEmail"
                name="supportEmail"
                type="email"
                defaultValue={platform.supportEmail}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="defaultAdoptionFee" className="text-sm font-semibold">
              {copy.adoptionFee}
            </label>
            <input
              id="defaultAdoptionFee"
              name="defaultAdoptionFee"
              defaultValue={platform.defaultAdoptionFee}
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground">{copy.adoptionFeeHint}</p>
          </div>

          <label className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4">
            <input
              type="checkbox"
              name="requireVerificationToPublish"
              defaultChecked={platform.requireVerificationToPublish}
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <span>
              <span className="text-sm font-semibold">{copy.requireVerification}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{copy.requireVerificationHint}</span>
            </span>
          </label>

          <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
            {copy.save}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <h2 className="text-lg font-bold">{dictionary.admin.filterConfigTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{dictionary.admin.filterConfigDescription}</p>
        <p className="mt-2 text-xs text-muted-foreground">{dictionary.admin.hint}</p>

        <form action={updatePetCatalogFilters} className="mt-5 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          {(
            [
              ["species", dictionary.admin.species, filterConfig.species],
              ["ageRanges", dictionary.admin.ageRanges, filterConfig.ageRanges],
              ["sizes", dictionary.admin.sizes, filterConfig.sizes],
              ["genders", dictionary.admin.genders, filterConfig.genders],
              ["compatibilities", dictionary.admin.compatibilities, filterConfig.compatibilities],
            ] as const
          ).map(([name, label, values]) => (
            <div key={name} className="space-y-2">
              <label htmlFor={name} className="text-sm font-semibold">
                {label}
              </label>
              <input id={name} name={name} defaultValue={values.join(", ")} className={inputClass} />
            </div>
          ))}
          <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
            {dictionary.admin.save}
          </button>
        </form>
      </section>
    </main>
  );
}
