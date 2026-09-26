import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getPetById } from "@/lib/pet-catalog/db-pets";
import { createPublicSupabaseClient } from "@/lib/supabase/public-client";
import { supabaseUrl, supabasePublishableKey } from "@/lib/supabase/config";
import { publicAnimalUrl } from "@/lib/help/public-url";
import { PrintButton } from "@/components/print-button";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Ficha para divulgação | FYA",
  robots: { index: false, follow: true },
};
export default async function PrintAnimal({
  params,
}: {
  params: Promise<{ locale: string; petId: string }>;
}) {
  const { locale, petId } = await params;
  if (!isLocale(locale) || !/^[0-9a-f-]{36}$/i.test(petId)) notFound();
  // Always use the anonymous view, even when the person printing is the owner.
  const pet = await getPetById(
    createPublicSupabaseClient(supabaseUrl, supabasePublishableKey),
    petId,
    locale,
  );
  if (!pet) notFound();
  const pt = locale === "pt",
    url = publicAnimalUrl(
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      locale,
      petId,
    ),
    qr = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 4,
      width: 360,
    });
  return (
    <main id="main-content" className="page-shell">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link className="underline" href={`/${locale}/pets/${petId}`}>
          ← {pt ? "Ficha do animal" : "Animal profile"}
        </Link>
        <PrintButton locale={locale} />
        <p className="w-full text-sm">
          {pt
            ? "A impressão inclui apenas informação pública. Confirma a pré-visualização antes de guardar."
            : "Printing includes public information only. Check the preview before saving."}
        </p>
        {["localhost", "127.0.0.1"].includes(new URL(url).hostname) && (
          <p role="status" className="w-full text-sm">
            {pt
              ? "Pré-visualização local: o QR só funcionará noutros dispositivos depois de configurar o endereço público da FYA."
              : "Local preview: configure FYA’s public address before sharing this QR with other devices."}
          </p>
        )}
      </div>
      <article className="animal-print-sheet mx-auto max-w-3xl rounded-3xl border bg-white p-8 text-[#203e38]">
        <div className="flex items-center justify-between gap-4">
          <p className="text-3xl font-extrabold">
            fya<span className="text-[#db7046]">.</span>
          </p>
          <p className="text-sm">
            {pet.shelterName} · {pet.location}
          </p>
        </div>
        <h1 className="display-title my-4 text-5xl">{pet.name}</h1>
        <div className="animal-print-photo relative h-72 w-full overflow-hidden rounded-2xl">
          <Image
            src={pet.imageUrl}
            alt={pet.name}
            fill
            unoptimized
            loading="eager"
            className="object-contain"
          />
        </div>
        <p className="my-4 font-semibold">
          {pet.species} · {pet.age} · {pet.sex} · {pet.status}
        </p>
        <p className="whitespace-pre-line leading-6">
          {pet.description.slice(0, 1000)}
          {pet.description.length > 1000 ? "…" : ""}
        </p>
        <div className="mt-6 flex items-center gap-5 border-t pt-5">
          <Image
            data-testid="animal-qr"
            src={qr}
            alt={
              pt
                ? "QR para a ficha pública do animal"
                : "QR linking to the animal public profile"
            }
            width={160}
            height={160}
            unoptimized
          />
          <div className="min-w-0">
            <h2 className="text-xl font-bold">
              {pt ? "Conhece a minha história" : "Discover my story"}
            </h2>
            <p className="mt-2 text-sm">
              {pt
                ? "Lê o QR para consultar a ficha e a disponibilidade atual."
                : "Scan the QR for my profile and current availability."}
            </p>
            <p className="mt-3 break-all text-xs">{url}</p>
            <p className="mt-3 text-xs">
              {pt ? "Ficha preparada em" : "Prepared on"}{" "}
              {new Date().toLocaleDateString(locale)}
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
