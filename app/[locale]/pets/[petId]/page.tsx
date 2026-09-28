import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
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
  if (!isLocale(locale)) return {};
  const pet = await getCachedPetById(
    await createServerSupabaseClient(),
    petId,
    locale,
  );
  if (!pet) return {};
  const pt = locale === "pt";
  return pageMetadata({
    locale,
    path: `/pets/${pet.id}`,
    title: pt
      ? `${pet.name}, ${pet.species} para adoção em ${pet.location}`
      : `${pet.name}, ${pet.species} for adoption in ${pet.location}`,
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
  if (!isLocale(locale) || !/^[0-9a-f-]{36}$/i.test(petId)) notFound();

  const pt = locale === "pt";
  const back = (await searchParams)?.back;
  const catalogPath =
    back && (back === `/${locale}/pets` || back.startsWith(`/${locale}/pets?`))
      ? back
      : `/${locale}/pets`;

  return (
    <main id="main-content" tabIndex={-1} className="page-shell">
      <Link
        href={catalogPath}
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        {pt ? "Explorar animais" : "Explore animals"}
      </Link>
      <Link
        className="mb-6 ml-5 inline-block text-sm underline"
        href={`/${locale}/pets/${petId}/imprimir`}
      >
        {pt ? "Ficha imprimível e QR" : "Printable profile and QR"}
      </Link>
      <Suspense fallback={<PetDetailBodySkeleton locale={locale} />}>
        <PetDetailBody locale={locale} petId={petId} />
      </Suspense>
    </main>
  );
}
