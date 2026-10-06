import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Brand } from "@/components/brand";

export function SiteFooter({ locale }: { locale: Locale }) {
  const { footer } = getDictionary(locale);

  const pt = locale === "pt";
  const linkGroups = [
    {
      title: footer.exploreTitle,
      links: [
        ["pets", footer.links.pets],
        ["canis", footer.links.shelters],
        ["historias", footer.links.stories],
        ["match", pt ? "Ajuda para escolher" : "Help choosing"],
        ["#sobre-nos", footer.links.about],
      ],
    },
    {
      title: pt ? "Para canis" : "For shelters",
      links: [
        ["para-canis", pt ? "FYA para canis" : "FYA for shelters"],
        ["auth/shelter-registration", footer.registerShelter],
        ["convites", pt ? "Convites de equipa" : "Team invitations"],
        ["parcerias", pt ? "Parcerias e marcas" : "Partnerships and brands"],
      ],
    },
    {
      title: pt ? "Ajuda" : "Help",
      links: [
        ["ajuda", pt ? "Centro de ajuda" : "Help centre"],
        ["conta/apoios", pt ? "As minhas ajudas" : "My support"],
      ],
    },
  ] as const;

  const legalLinks = [
    ["termos", pt ? "Condições de utilização" : "Terms of use"],
    ["privacidade", pt ? "Privacidade" : "Privacy"],
  ] as const;

  return (
    <footer className="mt-16 border-t border-border/60 bg-muted/40">
      <div className="page-shell grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Brand />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            {footer.tagline}
          </p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            {footer.joinDescription}
          </p>
        </div>
        {linkGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="eyebrow mb-4">{group.title}</p>
            <ul className="space-y-3 text-sm">
              {group.links.map(([path, label]) => (
                <li key={path}>
                  <Link
                    href={`/${locale}/${path}`}
                    className="inline-flex items-center gap-2 hover:text-accent"
                  >
                    {label}
                    <ArrowUpRight className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-border/50 px-8 py-5 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} FYA · Find Your Animal</p>
        <ul className="flex flex-wrap items-center gap-4">
          {legalLinks.map(([path, label]) => (
            <li key={path}>
              <Link
                href={`/${locale}/${path}`}
                className="hover:text-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-2">
          <Heart aria-hidden="true" className="size-3 text-accent" />
          {footer.closingLine}
        </p>
      </div>
    </footer>
  );
}
