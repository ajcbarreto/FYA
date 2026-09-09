import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Search,
  PawPrint,
  MessageCircle,
  House,
} from "lucide-react";
import { isLocale } from "@/lib/i18n/config";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getCatalogPets } from "@/lib/pet-catalog/db-pets";
import { AboutFamily } from "@/components/about-family";
import { PetCard } from "@/components/pet-card";
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const pt = locale === "pt";
  const pets = hasSupabaseEnv
    ? await getCatalogPets(await createServerSupabaseClient(), locale, {
        limit: 4,
      })
    : [];
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="page-shell grid items-center gap-10 pb-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-20">
        <div className="py-4 lg:py-10">
          <span className="eyebrow inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            {pt
              ? "Pequenos encontros. Grandes histórias."
              : "Small encounters. Big stories."}
          </span>
          <h1 className="display-title mt-6 max-w-2xl text-6xl sm:text-7xl xl:text-[88px]">
            {pt ? "O teu melhor amigo" : "Your best friend"}
            <br />
            <span className="italic text-secondary">
              {pt ? "está por aqui." : "is waiting here."}
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
            {pt
              ? "Há uma nova história à tua espera. Conhece animais para adoção e os abrigos que cuidam deles, até encontrarem um lugar a que chamar casa."
              : "A new story is waiting for you. Meet animals looking for a home and the shelters caring for them along the way."}
          </p>
          <form
            action={`/${locale}/pets`}
            className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-border/60 bg-white p-2 shadow-sm"
          >
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
            <label htmlFor="home-search" className="sr-only">
              {pt ? "Procurar um animal" : "Find an animal"}
            </label>
            <input
              id="home-search"
              name="q"
              placeholder={
                pt
                  ? "Quem gostavas de conhecer?"
                  : "Who would you like to meet?"
              }
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              className="button-primary px-5"
              aria-label={pt ? "Pesquisar" : "Search"}
            >
              <ArrowRight className="size-5" />
            </button>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="mr-1 text-muted-foreground">
              {pt ? "Quero conhecer" : "I'd love to meet"}
            </span>
            {[
              ["cao", pt ? "Cães" : "Dogs"],
              ["gato", pt ? "Gatos" : "Cats"],
              ["outro", pt ? "Outros amigos" : "Other friends"],
            ].map(([value, label]) => (
              <Link
                key={value}
                href={`/${locale}/pets?species=${value}`}
                className="rounded-full border border-border px-3.5 py-2 transition-colors hover:bg-muted"
              >
                {label}
                <ArrowUpRight className="ml-1 inline size-3" />
              </Link>
            ))}
          </div>
        </div>
        <div className="relative isolate mx-auto w-full max-w-xl pb-5">
          <div className="absolute -right-2 top-8 -z-10 h-[85%] w-[94%] rotate-3 rounded-[45%_45%_15%_15%] bg-[#dce5ce]" />
          <div className="relative aspect-[.95] overflow-hidden rounded-[45%_45%_12%_12%] bg-[#e5d6bd]">
            <Image
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=85"
              alt={
                pt
                  ? "Retrato ilustrativo de um cão ao ar livre"
                  : "Illustrative portrait of a dog outdoors"
              }
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
            <span className="absolute bottom-5 right-5 rounded-full bg-black/25 px-3 py-1 text-[10px] text-white">
              {pt ? "Imagem ilustrativa" : "Illustrative image"}
            </span>
          </div>
          <span className="absolute right-0 top-5 flex size-20 rotate-12 items-center justify-center rounded-full bg-[#e9edb9] text-primary shadow-sm">
            <PawPrint className="size-9" />
          </span>
          <div className="absolute -left-2 bottom-6 flex max-w-[85%] items-center gap-3 rounded-2xl border border-white bg-white/95 p-4 shadow-lg sm:-left-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f9e6dc] text-accent">
              <Heart className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold">
                {pt ? "Uma casa muda tudo." : "A home changes everything."}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {pt
                  ? "A próxima história pode ser a tua."
                  : "The next story could be yours."}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-border/50 bg-muted/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-8 py-6">
          {[
            pt ? "Adoção com responsabilidade" : "Responsible adoption",
            pt
              ? "Contacto direto com os abrigos"
              : "Direct contact with shelters",
            pt ? "Acompanhamento em cada passo" : "Support at every step",
          ].map((text, i) => (
            <p
              key={text}
              className="flex items-center gap-3 text-sm font-medium"
            >
              <span className="text-accent">0{i + 1}</span>
              {text}
            </p>
          ))}
        </div>
      </section>
      <section className="page-shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">
              {pt ? "À procura de uma família" : "Looking for a family"}
            </p>
            <h2 className="display-title mt-3 text-4xl sm:text-5xl">
              {pt ? "Um encontro que fica." : "A connection that lasts."}
            </h2>
          </div>
          <Link href={`/${locale}/pets`} className="button-secondary">
            {pt ? "Conhecer todos" : "Meet them all"}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
        {pets.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="surface flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <PawPrint className="size-10 text-secondary" />
            <p className="flex-1 text-muted-foreground">
              {pt
                ? "Cada adoção começa por conhecer melhor um animal. Explora o catálogo e encontra os próximos companheiros."
                : "Every adoption starts by getting to know an animal. Explore the catalog to find your next companion."}
            </p>
            <Link href={`/${locale}/pets`} className="button-primary">
              {pt ? "Explorar catálogo" : "Explore catalog"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </section>
      <section className="page-shell pt-4">
        <div className="rounded-[2rem] bg-primary px-6 py-10 text-primary-foreground sm:p-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-white/65">
                {pt ? "Mais perto de casa" : "Closer to home"}
              </p>
              <h2 className="display-title mt-3 text-4xl sm:text-5xl">
                {pt
                  ? "O início de uma boa história."
                  : "The start of a good story."}
              </h2>
            </div>
            <Link
              href={`/${locale}/match`}
              className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-8"
            >
              {pt ? "Ajuda-me a escolher" : "Help me choose"}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: pt ? "Encontra uma ligação" : "Find a connection",
                text: pt
                  ? "Descobre os animais, as suas histórias e as necessidades de cada um."
                  : "Discover animals, their stories and their individual needs.",
              },
              {
                icon: MessageCircle,
                title: pt ? "Vamos conversar" : "Start a conversation",
                text: pt
                  ? "Apresenta-te ao abrigo, coloca as tuas dúvidas e combina uma visita."
                  : "Introduce yourself to the shelter, ask questions and arrange a visit.",
              },
              {
                icon: House,
                title: pt ? "Abre a porta de casa" : "Open your door",
                text: pt
                  ? "Prepara a chegada com o abrigo e acompanha cada etapa da adoção."
                  : "Prepare for their arrival with the shelter and follow every step.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <article key={title} className="border-t border-white/20 pt-6">
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="size-6 text-[#dce6ae]" />
                  <span className="text-xs text-white/50">0{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-white/70">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <AboutFamily locale={locale} />
    </main>
  );
}
