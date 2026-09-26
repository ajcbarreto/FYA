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
