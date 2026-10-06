import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Cake,
  Check,
  Clock,
  Heart,
  Mail,
  MapPin,
  Mars,
  PawPrint,
  Phone,
  Ruler,
  ShieldCheck,
  Star,
  Tag,
  Venus,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getAuthUser } from "@/lib/supabase/get-user";
import { getCachedPetById } from "@/lib/pet-catalog/cached-pets";
import { getRelatedPets } from "@/lib/pet-catalog/db-pets";
import { getFavoriteAnimalIds } from "@/lib/favorites/db";
import { listAnimalPhotos } from "@/lib/canil/animal-photos";
import { FavoriteButton } from "@/components/favorite-button";
import { PetGallery } from "@/components/pet-gallery";
import { InfoPopover } from "@/components/info-popover";
import { ApplicationForm } from "@/components/application-form";
import { PetCard } from "@/components/pet-card";
import { Breadcrumbs, sectionCrumb } from "@/components/breadcrumbs";
import { canManageShelter } from "@/lib/canil/owned-shelter";
import {
  readPublicShelterQuery,
  type PublicShelter,
} from "@/lib/canil/public-shelter";
import { getShelterRatingSummaries } from "@/lib/canil/reviews";
import { sizeLabel, speciesLabel } from "@/lib/i18n/animals";

type PetDetailBodyProps = {
  locale: Locale;
  petId: string;
  /** Catalog URL with the filters the visitor came from. */
  catalogPath: string;
};

export async function PetDetailBody({
  locale,
  petId,
  catalogPath,
}: PetDetailBodyProps) {
  const pt = locale === "pt";
  const supabase = await createServerSupabaseClient();
  const [pet, related, photos, favorites, animal, { user }] = await Promise.all(
    [
      getCachedPetById(supabase, petId, locale),
      getRelatedPets(supabase, petId, locale),
      listAnimalPhotos(supabase, petId),
      getAuthUser().then(({ user }) =>
        user ? getFavoriteAnimalIds(supabase, user.id) : new Set<string>(),
      ),
      supabase
        .from("animais")
        .select("status,compatibilidades,especie,raca,porte,sexo")
        .eq("id", petId)
        .single(),
      getAuthUser(),
    ],
  );

  if (!pet) notFound();

  const [shelter, details, available, ratings] = await Promise.all([
    readPublicShelterQuery<PublicShelter>((columns) =>
      supabase.from("canis").select(columns).eq("id", pet.shelterId).single(),
    ),
    // Visit hours are optional and may not exist before the shelter page migration.
    supabase
      .from("shelter_public_details")
      .select("visit_hours")
      .eq("canil_id", pet.shelterId)
      .maybeSingle(),
    supabase
      .from("animais")
      .select("id", { count: "exact", head: true })
      .eq("canil_id", pet.shelterId)
      .eq("status", "disponivel"),
    getShelterRatingSummaries(supabase, [pet.shelterId]),
  ]);

  if (!shelter || animal.error) {
    throw new Error("Unable to verify animal availability");
  }
  const visitHours = details.error ? null : details.data?.visit_hours;
  const rating = ratings.get(pet.shelterId);
  const compatibilities: string[] = animal.data?.compatibilidades ?? [];
  const compatibilityChecks = [
    ["children", pt ? "Crianças" : "Children"],
    ["seniors", pt ? "Pessoas seniores" : "Seniors"],
    ["apartment", pt ? "Vida em apartamento" : "Apartment life"],
    ["trained", pt ? "Já tem educação básica" : "Basic training"],
  ]
    .filter(([key]) => compatibilities.includes(key))
    .map(([key, label]) => ({ key, label }));
  const headlineFacts = [
    [pt ? "Sexo" : "Sex", pet.sex],
    [pt ? "Idade" : "Age", pet.age],
    ...(animal.data?.porte
      ? [[pt ? "Porte" : "Size", sizeLabel(animal.data.porte, locale)]]
      : []),
  ];
  const facts: [string, string, typeof Tag][] = [
    [
      pt ? "Espécie" : "Species",
      speciesLabel(animal.data?.especie ?? "", locale),
      PawPrint,
    ],
    [
      pt ? "Raça" : "Breed",
      animal.data?.raca || (pt ? "Sem raça definida" : "Mixed breed"),
      Tag,
    ],
    [
      pt ? "Sexo" : "Sex",
      pet.sex,
      animal.data?.sexo === "femea" ? Venus : Mars,
    ],
    [pt ? "Idade" : "Age", pet.age, Cake],
    ...(animal.data?.porte
      ? [
          [
            pt ? "Porte" : "Size",
            sizeLabel(animal.data.porte, locale),
            Ruler,
          ] as [string, string, typeof Tag],
        ]
      : []),
  ];

  // The printable sheet is a promotion tool for the animal's own shelter team.
  const canPrint = user
    ? await canManageShelter(supabase, pet.shelterId)
    : false;

  const gallery = photos
    .filter((photo) => photo.public_url)
    .map((photo) => photo.public_url!);

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          { ...sectionCrumb(locale, "pets"), href: catalogPath },
          { label: pet.name },
        ]}
        currentPath={`/pets/${pet.id}`}
      />
      {canPrint && (
        <Link
          className="mb-6 inline-block text-sm underline"
          href={`/${locale}/pets/${pet.id}/imprimir`}
        >
          {pt
            ? `Ficha imprimível de ${pet.name}, com código QR`
            : `Printable profile of ${pet.name}, with QR code`}
        </Link>
      )}
      <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
        <div className="space-y-7">
          <PetGallery
            photos={gallery.length ? gallery : [pet.imageUrl]}
            name={pet.name}
            locale={locale}
          >
            <span className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold">
              {pet.status}
            </span>
            <FavoriteButton
              animalId={pet.id}
              locale={locale}
              isFavorite={favorites.has(pet.id)}
              redirectTo={`/${locale}/pets/${pet.id}`}
            />
          </PetGallery>
          <section className="surface">
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow">
                {pt ? "Sobre este animal" : "About this animal"}
              </p>
              <InfoPopover
                label={pt ? "Antes de decidir" : "Before you decide"}
                closeLabel={pt ? "Fechar" : "Close"}
              >
                <strong className="mb-1 block text-foreground">
                  {pt ? "Antes de decidir" : "Before you decide"}
                </strong>
                {pt
                  ? "Confirma com o abrigo a vacinação, os cuidados de saúde e os eventuais custos da adoção. Cada animal tem necessidades próprias."
                  : "Ask the shelter about vaccinations, health care and any adoption costs. Every animal has individual needs."}
              </InfoPopover>
            </div>
            <h2 className="display-title mt-3 text-3xl">
              {pt ? `Um pouco sobre ${pet.name}` : `A little about ${pet.name}`}
            </h2>
            <p className="mt-5 whitespace-pre-wrap leading-7 text-foreground/80">
              {pet.description ||
                (pt
                  ? "O abrigo ainda não escreveu uma descrição. Podes perguntar à equipa por mensagem."
                  : "The shelter has not written a description yet. You can ask the team by message.")}
            </p>
            <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl border border-border p-5 sm:grid-cols-3">
              {facts.map(([label, value, Icon]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eef3e6] text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-semibold leading-tight">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            {compatibilityChecks.length > 0 && (
              <>
                <h3 className="mt-7 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {pt ? "Vive bem com" : "Gets on well with"}
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {compatibilityChecks.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-center gap-3 rounded-2xl bg-[#eef3e6] px-4 py-3 text-sm font-semibold"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-4" strokeWidth={3} />
                      </span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
        <div className="space-y-6">
          <header>
            <p className="eyebrow">{pt ? "Para adoção" : "For adoption"}</p>
            <h1 className="display-title mt-3 text-6xl">{pet.name}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {pet.location} · {pet.shelterName}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {headlineFacts.map(([label, value]) => (
                <li
                  key={label}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-semibold"
                >
                  <span className="sr-only">{label}: </span>
                  {value}
                </li>
              ))}
            </ul>
          </header>
          <section className="surface">
            <div className="mb-5 flex items-center gap-2">
              <Heart className="size-5 text-accent" />
              <h2 className="text-xl font-semibold">
                {pt ? "Candidatar-me a adotar" : "Apply to adopt"}
              </h2>
            </div>
            <ApplicationForm
              petId={pet.id}
              petName={pet.name}
              locale={locale}
              userId={user?.id ?? null}
              canApply={["disponivel", "reservado"].includes(
                animal.data?.status ?? "",
              )}
            />
          </section>
          <aside className="rounded-3xl bg-[#4a504c] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-white/10">
                {shelter.image_url ? (
                  <Image
                    src={shelter.image_url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <PawPrint className="absolute inset-0 m-auto size-6 text-white/60" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white/60">
                  {pt ? "Abrigo responsável" : "Shelter in charge"}
                </p>
                <h2 className="truncate font-semibold">{shelter.nome}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
                  {shelter.verificado && (
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-3.5" />
                      {pt ? "Verificado" : "Verified"}
                    </span>
                  )}
                  {rating && rating.count > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-[#f2c14e] text-[#f2c14e]" />
                      {rating.average.toFixed(1)} ({rating.count})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ul className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm text-white/85">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/50" />
                {shelter.localizacao}
              </li>
              {visitHours && (
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-white/50" />
                  {visitHours}
                </li>
              )}
              {shelter.telefone && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-white/50" />
                  <a
                    href={`tel:${shelter.telefone.replace(/\s/g, "")}`}
                    className="hover:underline"
                  >
                    {shelter.telefone}
                  </a>
                </li>
              )}
              {shelter.email_contacto && (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-white/50" />
                  <a
                    href={`mailto:${shelter.email_contacto}`}
                    className="break-all hover:underline"
                  >
                    {shelter.email_contacto}
                  </a>
                </li>
              )}
              {(available.count ?? 0) > 0 && (
                <li className="flex gap-3">
                  <PawPrint className="mt-0.5 size-4 shrink-0 text-white/50" />
                  {pt
                    ? `${available.count} ${available.count === 1 ? "animal disponível" : "animais disponíveis"} para adoção`
                    : `${available.count} ${available.count === 1 ? "animal" : "animals"} available for adoption`}
                </li>
              )}
            </ul>
            <Link
              href={`/${locale}/canis/${pet.shelterId}`}
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#4a504c] transition-colors hover:bg-white/90"
            >
              {pt ? "Conhecer o abrigo" : "Visit the shelter page"}
              <ArrowUpRight className="size-4" />
            </Link>
          </aside>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-7 flex items-end justify-between gap-4">
            <h2 className="display-title text-4xl">
              {pt ? "Outros animais para adoção" : "Other animals for adoption"}
            </h2>
            <Link href={`/${locale}/pets`} className="text-sm font-semibold">
              {pt ? "Ver todos" : "View all"}
              <ArrowUpRight className="ml-1 inline size-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {related.map((relatedPet) => (
              <PetCard key={relatedPet.id} pet={relatedPet} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
