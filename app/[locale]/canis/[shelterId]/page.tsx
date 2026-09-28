import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ShelterDetailBody } from "@/components/shelter-detail-body";
import { ShelterDetailBodySkeleton } from "@/components/skeletons/shelter-detail-skeleton";
import { isLocale } from "@/lib/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCachedPublicShelterById } from "@/lib/canil/cached-shelter";
import { pageMetadata } from "@/lib/seo/metadata";
import { describe } from "@/lib/seo/site";

type ShelterPublicPageProps = {
  params: Promise<{ locale: string; shelterId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; shelterId: string }>;
}): Promise<Metadata> {
  const { locale, shelterId } = await params;
  if (!isLocale(locale)) return {};

  const supabase = await createServerSupabaseClient();
  const shelter = await getCachedPublicShelterById(supabase, shelterId);
  if (!shelter) return {};

  const pt = locale === "pt";
  return pageMetadata({
    locale,
    path: `/canis/${shelter.id}`,
    title: pt
      ? `${shelter.nome}, animais para adoção em ${shelter.localizacao}`
      : `${shelter.nome}, animals for adoption in ${shelter.localizacao}`,
    description: describe(
      shelter.missao,
      pt
        ? `Conhece ${shelter.nome} (${shelter.localizacao}), os animais que tem para adoção e como contactar a equipa na FYA.`
        : `Meet ${shelter.nome} (${shelter.localizacao}), the animals it has for adoption and how to contact the team on FYA.`,
    ),
    image: shelter.image_url
      ? { url: shelter.image_url, alt: shelter.nome }
      : null,
  });
}

export default async function ShelterPublicPage({
  params,
  searchParams,
}: ShelterPublicPageProps) {
  const { locale, shelterId } = await params;
  const { success, error } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const backLabel = locale === "pt" ? "Voltar aos canis" : "Back to shelters";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-7xl flex-1 px-5 pb-16 pt-8 sm:px-8"
    >
      <Link
        href={`/${locale}/canis`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <Suspense fallback={<ShelterDetailBodySkeleton locale={locale} />}>
        <ShelterDetailBody
          locale={locale}
          shelterId={shelterId}
          success={success}
          error={error}
        />
      </Suspense>
    </main>
  );
}
