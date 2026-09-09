import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Heart,
  ShieldCheck,
  Info,
} from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getPetById, getRelatedPets } from "@/lib/pet-catalog/db-pets";
import { getFavoriteAnimalIds } from "@/lib/favorites/db";
import { listAnimalPhotos } from "@/lib/canil/animal-photos";
import { FavoriteButton } from "@/components/favorite-button";
import { ApplicationForm } from "@/components/application-form";
import { PetCard } from "@/components/pet-card";
type Props = {
  searchParams?: Promise<{ back?: string }>;
  params: Promise<{ locale: string; petId: string }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, petId } = await params;
  if (!isLocale(locale)) return {};
  const pet = await getPetById(
    await createServerSupabaseClient(),
    petId,
    locale,
  );
  if (!pet) return {};
  return {
    title: `${pet.name} | FYA`,
    description: pet.description.slice(0, 160),
    openGraph: { title: `${pet.name} | FYA`, images: [pet.imageUrl] },
  };
}
export default async function PetDetails({ params, searchParams }: Props) {
  const { locale, petId } = await params;
  if (!isLocale(locale) || !/^[0-9a-f-]{36}$/i.test(petId)) notFound();
  const pt = locale === "pt";
  const back = (await searchParams)?.back;
  const catalogPath =
    back && (back === `/${locale}/pets` || back.startsWith(`/${locale}/pets?`))
      ? back
      : `/${locale}/pets`;
  const supabase = await createServerSupabaseClient();
  const [pet, related, photos, auth] = await Promise.all([
    getPetById(supabase, petId, locale),
    getRelatedPets(supabase, petId, locale),
    listAnimalPhotos(supabase, petId),
    supabase.auth.getUser(),
  ]);
  if (!pet) notFound();
  const [favorites, shelter, animal] = await Promise.all([
    auth.data.user
      ? getFavoriteAnimalIds(supabase, auth.data.user.id)
      : Promise.resolve(new Set<string>()),
    supabase
      .from("canis")
      .select("verificado")
      .eq("id", pet.shelterId)
      .single(),
    supabase.from("animais").select("status").eq("id", petId).single(),
  ]);
  if (shelter.error || animal.error)
    throw new Error("Unable to verify animal availability");
  const gallery = photos.filter((p) => p.public_url).map((p) => p.public_url!);
  return (
    <main id="main-content" tabIndex={-1} className="page-shell">
      <Link
        href={catalogPath}
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        {pt ? "Explorar animais" : "Explore animals"}
      </Link>
      <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
        <div className="space-y-7">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-muted">
            <Image
              src={gallery[0] ?? pet.imageUrl}
              alt={pet.name}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 55vw"
              className="object-cover"
            />
            <span className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold">
              {pet.status}
            </span>
            <FavoriteButton
              animalId={pet.id}
              locale={locale}
              isFavorite={favorites.has(pet.id)}
              redirectTo={`/${locale}/pets/${pet.id}`}
            />
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {gallery.slice(1, 7).map((url, i) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${pt ? "Abrir fotografia" : "Open photo"} ${i + 2}`}
                  className="relative aspect-square overflow-hidden rounded-2xl"
                >
                  <Image
                    src={url}
                    alt={`${pet.name} · ${i + 2}`}
                    fill
                    sizes="(max-width:1024px) 30vw, 18vw"
                    className="object-cover"
                  />
                </a>
              ))}
            </div>
          )}
          <section className="surface">
            <p className="eyebrow">
              {pt ? "Uma história para conhecer" : "A story to discover"}
            </p>
            <h2 className="display-title mt-3 text-3xl">
              {pt ? `Um pouco sobre ${pet.name}` : `A little about ${pet.name}`}
            </h2>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
              {pet.description ||
                (pt
                  ? "O abrigo ainda não adicionou uma descrição. Conversa com a equipa para saber mais sobre este amigo."
                  : "The shelter has not added a description yet. Contact the team to learn more about this friend.")}
            </p>
          </section>
          <section className="rounded-2xl bg-muted p-6">
            <div className="flex items-center gap-2">
              <Info className="size-4" />
              <h2 className="font-semibold">
                {pt ? "Conhecer antes de decidir" : "Get to know them first"}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {pt
                ? "Confirma com o abrigo a vacinação, os cuidados de saúde, a compatibilidade com a tua família e os eventuais custos da adoção. Cada animal tem necessidades próprias."
                : "Ask the shelter about vaccinations, health care, compatibility with your family and any adoption costs. Every animal has individual needs."}
            </p>
          </section>
        </div>
        <div className="space-y-6">
          <header>
            <p className="eyebrow">
              {pt ? "Um lugar na tua vida" : "A place in your life"}
            </p>
            <h1 className="display-title mt-3 text-6xl">{pet.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {pet.location} · {pet.shelterName}
            </p>
          </header>
          <dl className="grid grid-cols-3 gap-3">
            {[
              [pt ? "Raça / espécie" : "Breed / species", pet.species],
              [pt ? "Idade" : "Age", pet.age],
              [pt ? "Sexo" : "Sex", pet.sex],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-muted p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <section className="surface">
            <div className="mb-5 flex items-center gap-2">
              <Heart className="size-5 text-accent" />
              <h2 className="text-xl font-semibold">
                {pt ? "Vamos conhecer-nos?" : "Shall we meet?"}
              </h2>
            </div>
            <ApplicationForm
              petId={pet.id}
              petName={pet.name}
              locale={locale}
              userId={auth.data.user?.id ?? null}
              canApply={["disponivel", "reservado"].includes(
                animal.data?.status ?? "",
              )}
            />
          </section>
          <Link
            href={`/${locale}/canis/${pet.shelterId}`}
            className="flex items-center justify-between gap-4 rounded-2xl bg-primary p-6 text-white"
          >
            <div>
              <p className="text-xs text-white/65">
                {pt ? "A cuidar deste amigo" : "Caring for this friend"}
              </p>
              <h2 className="mt-1 font-semibold">{pet.shelterName}</h2>
              {shelter.data?.verificado && (
                <p className="mt-2 flex items-center gap-1 text-xs text-white/75">
                  <ShieldCheck className="size-3" />
                  {pt ? "Abrigo verificado" : "Verified shelter"}
                </p>
              )}
            </div>
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-7 flex items-end justify-between gap-4">
            <h2 className="display-title text-4xl">
              {pt ? "Mais amigos para conhecer." : "More friends to meet."}
            </h2>
            <Link href={`/${locale}/pets`} className="text-sm font-semibold">
              {pt ? "Ver todos" : "View all"}
              <ArrowUpRight className="ml-1 inline size-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {related.map((p) => (
              <PetCard key={p.id} pet={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
