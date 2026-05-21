import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Star, Trash2, Upload } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { listAnimalPhotos } from "@/lib/canil/animal-photos";
import { AnimalForm } from "@/components/animal-form";
import { ToastFeedback } from "@/components/toast-feedback";
import {
  deleteUserAnimal,
  deleteUserAnimalPhoto,
  setPrimaryUserAnimalPhoto,
  updateUserAnimal,
  uploadUserAnimalPhoto,
} from "@/app/[locale]/(dashboard)/user/animais/actions";

type UserAnimalEditPageProps = {
  params: Promise<{ locale: string; animalId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function UserAnimalEditPage({ params, searchParams }: UserAnimalEditPageProps) {
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
    redirect(`/${locale}/auth/login?next=/user/animais/${animalId}`);
  }

  const { data: animal } = await supabase
    .from("animais")
    .select("id,owner_profile_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao")
    .eq("id", animalId)
    .maybeSingle<{
      id: string;
      owner_profile_id: string | null;
      nome: string;
      especie: string;
      raca: string | null;
      sexo: string | null;
      idade_anos: number | null;
      porte: string | null;
      status: string;
      descricao: string | null;
    }>();

  if (!animal || animal.owner_profile_id !== user.id) {
    notFound();
  }

  const photos = await listAnimalPhotos(supabase, animalId);
  const dict = getDictionary(locale);
  const editCopy = dict.canilEditAnimal;
  const copy = { ...editCopy, title: animal.nome, subtitle: dict.userEditAnimal.subtitle };
  const feedback =
    (success && editCopy.messages[success]) ||
    (error && editCopy.messages[error]) ||
    null;

  return (
    <main className="space-y-6">
      <Link
        href={`/${locale}/user/animais`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {copy.back}
      </Link>

      <header className="rounded-3xl border border-border/20 bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
      </header>

      <ToastFeedback message={feedback} variant={success ? "success" : "error"} />

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <h2 className="mb-4 text-lg font-bold">{copy.detailsTitle}</h2>
        <AnimalForm
          locale={locale}
          action={updateUserAnimal}
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
          }}
        />
      </section>

      <section className="rounded-3xl border border-border/20 bg-card p-6">
        <h2 className="text-lg font-bold">{copy.uploadTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{copy.uploadHint}</p>
        <form action={uploadUserAnimalPhoto} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="animalId" value={animal.id} />
          <input
            type="file"
            name="photo"
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
                    <form action={setPrimaryUserAnimalPhoto}>
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
                  <form action={deleteUserAnimalPhoto}>
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

      <section className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-lg font-bold text-destructive">{copy.dangerTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{copy.dangerHint}</p>
        <form action={deleteUserAnimal} className="mt-4">
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
