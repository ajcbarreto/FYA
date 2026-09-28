import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getCachedPetById } from "@/lib/pet-catalog/cached-pets";
import { PetDetailBody } from "@/components/pet-detail-body";
import { PetDetailBodySkeleton } from "@/components/skeletons/pet-detail-skeleton";
import { pageMetadata } from "@/lib/seo/metadata";
import { describe } from "@/lib/seo/site";

type Props = {
  searchParams?: Promise<{ back?: string }>;
  params: Promise<{ locale: string; petId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, petId } = await params;
  if (!isLocale(locale) || !hasSupabaseEnv) return {};
  const pet = await getCachedPetById(
    await createServerSupabaseClient(),
    petId,
    locale,
  );
  if (!pet) return {};
  const pt = locale === "pt";
  const species = pet.species.toLocaleLowerCase(locale);
  return pageMetadata({
    locale,
    path: `/pets/${pet.id}`,
    title: pt
      ? `${pet.name}, ${species} para adoção em ${pet.location}`
      : `${pet.name}, ${species} for adoption in ${pet.location}`,
    description: describe(
      pet.description,
      pt
        ? `${pet.name} está para adoção em ${pet.shelterName}. Vê a ficha, as fotografias e envia a candidatura na FYA.`
        : `${pet.name} is available for adoption at ${pet.shelterName}. See the profile and photos and apply on FYA.`,
    ),
    image: pet.imageUrl.startsWith("/animal-placeholder")
      ? null
      : { url: pet.imageUrl, alt: pet.name },
    type: "article",
  });
}

export default async function PetDetails({ params, searchParams }: Props) {
  const { locale, petId } = await params;
  // Without Supabase configured no animal can exist.
  if (!isLocale(locale) || !hasSupabaseEnv || !/^[0-9a-f-]{36}$/i.test(petId))
    notFound();

  const back = (await searchParams)?.back;
  const catalogPath =
    back && (back === `/${locale}/pets` || back.startsWith(`/${locale}/pets?`))
      ? back
      : `/${locale}/pets`;

  return (
    <main id="main-content" tabIndex={-1} className="page-shell">
      <Suspense fallback={<PetDetailBodySkeleton locale={locale} />}>
        <PetDetailBody
          locale={locale}
          petId={petId}
          catalogPath={catalogPath}
        />
      </Suspense>
    </main>
  );
}
