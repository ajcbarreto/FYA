import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Brand } from "@/components/brand";

export function SiteFooter({ locale }: { locale: Locale }) {
  const { footer } = getDictionary(locale);

  const footerLinks = [
    ["pets", footer.links.pets],
    ["canis", footer.links.shelters],
    ["historias", footer.links.stories],
    ["match", locale === "pt" ? "Ajuda para escolher" : "Help choosing"],
    ["para-canis", locale === "pt" ? "FYA para canis" : "FYA for shelters"],
    ["ajuda", locale === "pt" ? "Centro de ajuda" : "Help centre"],
    ["#sobre-nos", footer.links.about],
    ["termos", locale === "pt" ? "Condições de utilização" : "Terms of use"],
    ["privacidade", locale === "pt" ? "Privacidade" : "Privacy"],
    ["conta/apoios", locale === "pt" ? "As minhas ajudas" : "My support"],
    ["convites", locale === "pt" ? "Convites de equipa" : "Team invitations"],
  ] as const;

  return (
    <footer className="mt-16 border-t border-border/60 bg-muted/40">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            {footer.tagline}
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4">{footer.exploreTitle}</p>
          <ul className="space-y-3 text-sm">
            {footerLinks.map(([path, label]) => (
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
        </div>
        <div>
          <p className="eyebrow mb-4">{footer.joinTitle}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {footer.joinDescription}
          </p>
          <Link
            href={`/${locale}/auth/shelter-registration`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
          >
            {footer.registerShelter}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-border/50 px-8 py-5 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} FYA · Found Your Animal</p>
      </div>
    </footer>
  );
}
