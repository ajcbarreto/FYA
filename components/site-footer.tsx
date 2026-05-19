import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

type SiteFooterProps = {
  locale: Locale;
};

export function SiteFooter({ locale }: SiteFooterProps) {
  const isPt = locale === "pt";
  const copy = isPt
    ? {
        tagline: "Ajudamos cada animal a encontrar uma familia para sempre.",
        discover: "Descobrir",
        support: "Suporte",
        discoverLinks: [
          { label: "Catalogo de pets", href: `/${locale}/pets` },
          { label: "Canis", href: `/${locale}/canis` },
          { label: "Historias de sucesso", href: `/${locale}/historias` },
          { label: "Encontrar o meu match", href: `/${locale}/match` },
        ],
        supportLinks: ["Centro de ajuda", "Contacto", "Privacidade", "Termos de servico"],
        crafted: "© 2026 FYA (Found Your Animal). Feito com carinho.",
      }
    : {
        tagline: "We help every animal find a family forever.",
        discover: "Discover",
        support: "Support",
        discoverLinks: [
          { label: "Pet catalog", href: `/${locale}/pets` },
          { label: "Shelters", href: `/${locale}/canis` },
          { label: "Success stories", href: `/${locale}/historias` },
          { label: "Find my match", href: `/${locale}/match` },
        ],
        supportLinks: ["Help center", "Contact", "Privacy", "Terms of service"],
        crafted: "© 2026 FYA (Found Your Animal). Made with care.",
      };

  return (
    <footer className="mt-20 w-full border-t border-border/40 bg-muted/40">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <span className="text-xl font-bold text-primary">FYA</span>
          <p className="max-w-xs text-sm text-muted-foreground">{copy.tagline}</p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold">{copy.discover}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {copy.discoverLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold">{copy.support}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {copy.supportLinks.map((link) => (
              <li key={link}>{link}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/30 px-6 py-5 text-center text-xs text-muted-foreground lg:px-8">
        {copy.crafted}
      </div>
    </footer>
  );
}
