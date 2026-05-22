import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Star, Trash2, Upload } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getShelterForUser } from "@/lib/canil/shelter-data";
import { listAnimalPhotos } from "@/lib/canil/animal-photos";
import { listHealthEvents } from "@/lib/canil/animal-health";
import { AnimalForm } from "@/components/animal-form";
import { ToastFeedback } from "@/components/toast-feedback";
import { PageHeader } from "@/components/page-header";
import { AnimalHealthEditor } from "@/components/animal-health-editor";
import {
  deleteAnimal,
  deleteAnimalPhoto,
  setPrimaryAnimalPhoto,
  updateAnimal,
  uploadAnimalPhoto,
} from "@/app/[locale]/(dashboard)/canil/animais/actions";

type AnimalEditPageProps = {
  params: Promise<{ locale: string; animalId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function AnimalEditPage({ params, searchParams }: AnimalEditPageProps) {
  const { locale, animalId } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login?next=/canil/animais/${animalId}`);
  }

  const { shelter } = await getShelterForUser(supabase, user.id);
  if (!shelter) {
    redirect(`/${locale}/canil/animais?error=no_shelter`);
  }

  const { data: animal } = await supabase
    .from("animais")
    .select(
      "id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,taxa_adocao,peso_kg,vacinado,microchip,esterilizado",
    )
    .eq("id", animalId)
    .maybeSingle<{
      id: string;
      canil_id: string;
      nome: string;
      especie: string;
      raca: string | null;
      sexo: string | null;
      idade_anos: number | null;
      porte: string | null;
      status: string;
      descricao: string | null;
      taxa_adocao: number | string | null;
      peso_kg: number | string | null;
      vacinado: boolean | null;
      microchip: boolean | null;
      esterilizado: boolean | null;
    }>();

  if (!animal || animal.canil_id !== shelter.id) {
    notFound();
  }

  const photos = await listAnimalPhotos(supabase, animalId);
  const healthEvents = await listHealthEvents(supabase, animalId);
  const dict = getDictionary(locale);
  const copy = { ...dict.canilEditAnimal, title: animal.nome };
  const healthCopy = dict.animalHealth;
  const feedback =
    (success && copy.messages[success]) ||
    (success && healthCopy.successMessages[success]) ||
    (error && copy.messages[error]) ||
    (error && healthCopy.errorMessages[error]) ||
    null;

  return (
    <main className="space-y-6">
      <Link
        href={`/${locale}/canil/animais`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {copy.back}
      </Link>

      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <h2 className="mb-4 text-lg font-bold">{copy.detailsTitle}</h2>
        <AnimalForm
          locale={locale}
          action={updateAnimal}
          animalId={animal.id}
          submitLabel={copy.saveDetails}
          values={{
            nome: animal.nome,
            especie: animal.especie,
            raca: animal.raca,
            sexo: animal.sexo,
            idade_anos: animal.idade_anos,
            porte: animal.porte,
            status: animal.status,
            descricao: animal.descricao,
            taxa_adocao:
              animal.taxa_adocao === null || animal.taxa_adocao === undefined
                ? null
                : typeof animal.taxa_adocao === "number"
                  ? animal.taxa_adocao
                  : Number.parseFloat(animal.taxa_adocao),
            peso_kg:
              animal.peso_kg === null || animal.peso_kg === undefined
                ? null
                : typeof animal.peso_kg === "number"
                  ? animal.peso_kg
                  : Number.parseFloat(animal.peso_kg),
            vacinado: animal.vacinado,
            microchip: animal.microchip,
            esterilizado: animal.esterilizado,
          }}
        />
      </section>

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <h2 className="text-lg font-bold">{copy.uploadTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{copy.uploadHint}</p>
        <form action={uploadAnimalPhoto} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="animalId" value={animal.id} />
          <input
            type="file"
            name="photo"
            multiple
            accept="image/jpeg,image/png,image/webp"
            required
            className="flex-1 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-bold file:text-primary-foreground"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            <Upload className="h-4 w-4" />
            {copy.upload}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        {photos.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.noPhotos}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-2xl border border-border/20">
                <div className="relative aspect-square bg-muted">
                  {photo.public_url ? (
                    <Image
                      src={photo.public_url}
                      alt={animal.nome}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : null}
                  {photo.is_primary && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      <Star className="h-3 w-3 fill-current" />
                      {copy.primary}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {!photo.is_primary && (
                    <form action={setPrimaryAnimalPhoto}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="animalId" value={animal.id} />
                      <input type="hidden" name="photoId" value={photo.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold hover:bg-muted/80"
                      >
                        <Star className="h-3 w-3" />
                        {copy.setPrimary}
                      </button>
                    </form>
                  )}
                  <form action={deleteAnimalPhoto}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="animalId" value={animal.id} />
                    <input type="hidden" name="photoId" value={photo.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/25"
                    >
                      <Trash2 className="h-3 w-3" />
                      {copy.remove}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <AnimalHealthEditor
        locale={locale as Locale}
        scope="canil"
        animalId={animal.id}
        events={healthEvents}
      />

      <section className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-lg font-bold text-destructive">{copy.dangerTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{copy.dangerHint}</p>
        <form action={deleteAnimal} className="mt-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="animalId" value={animal.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-bold text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
            {copy.deleteAnimal}
          </button>
        </form>
      </section>
    </main>
  );
}
