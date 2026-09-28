import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { ClientGetForm } from "@/components/client-get-form";
import { LocaleDocument } from "@/components/locale-document";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { getLocaleFromHeaders } from "@/lib/i18n/locale-from-headers";

// Serves unmatched URLs, notFound() calls and the proxy's 404 rewrites for
// missing animals, shelters, campaigns and guides, always with HTTP 404.
export default async function NotFound() {
  const locale = await getLocaleFromHeaders();
  const pt = locale === "pt";
  const copy = pt
    ? {
        title: "Página não encontrada | FYA",
        eyebrow: "Erro 404",
        heading: "Não encontrámos esta página",
        text: "O endereço pode estar mal escrito ou a página já não existir. Se procuravas um animal, pode já ter sido adotado ou o canil pode ter retirado a ficha.",
        searchLabel: "Procurar um animal para adoção",
        searchPlaceholder: "Nome ou raça",
        searchSubmit: "Procurar",
        linksTitle: "Outros sítios por onde podes continuar",
        links: [
          ["", "Página inicial"],
          ["/pets", "Animais para adoção"],
          ["/canis", "Canis e associações"],
          ["/ajuda", "Centro de ajuda"],
          ["/para-canis", "FYA para canis"],
        ],
      }
    : {
        title: "Page not found | FYA",
        eyebrow: "Error 404",
        heading: "We couldn't find this page",
        text: "The address may be mistyped or the page no longer exists. If you were looking for an animal, it may have been adopted or the shelter may have removed the profile.",
        searchLabel: "Search for an animal to adopt",
        searchPlaceholder: "Name or breed",
        searchSubmit: "Search",
        linksTitle: "Other places to continue from",
        links: [
          ["", "Home page"],
          ["/pets", "Animals for adoption"],
          ["/canis", "Shelters and rescue groups"],
          ["/ajuda", "Help centre"],
          ["/para-canis", "FYA for shelters"],
        ],
      };

  return (
    <>
      <title>{copy.title}</title>
      <LocaleDocument locale={locale} />
      <Navbar locale={locale} />
      <main
        id="main-content"
        tabIndex={-1}
        className="page-shell grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start"
      >
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="display-title mt-4 text-4xl sm:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            {copy.text}
          </p>
          <ClientGetForm
            action={`/${locale}/pets`}
            className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-border/60 bg-white p-2"
          >
            <Search
              aria-hidden="true"
              className="ml-3 size-5 shrink-0 text-muted-foreground"
            />
            <label htmlFor="not-found-search" className="sr-only">
              {copy.searchLabel}
            </label>
            <input
              id="not-found-search"
              name="q"
              placeholder={copy.searchPlaceholder}
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button className="button-primary px-5">{copy.searchSubmit}</button>
          </ClientGetForm>
        </div>
        <nav
          aria-labelledby="not-found-links"
          className="border-l-4 border-secondary pl-6"
        >
          <h2 id="not-found-links" className="text-lg font-semibold">
            {copy.linksTitle}
          </h2>
          <ul className="mt-4 space-y-3">
            {copy.links.map(([path, label]) => (
              <li key={path}>
                <Link
                  href={`/${locale}${path}`}
                  className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                >
                  {label}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
