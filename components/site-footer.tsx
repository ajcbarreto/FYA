import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type SiteFooterProps = {
  locale: Locale;
};

export function SiteFooter({ locale }: SiteFooterProps) {
  const copy = getDictionary(locale).footer;
  const discoverLinks = [
    { label: copy.petCatalog, href: `/${locale}/pets` },
    { label: copy.shelters, href: `/${locale}/canis` },
    { label: copy.successStories, href: `/${locale}/historias` },
    { label: copy.findMatch, href: `/${locale}/match` },
  ];
  const supportLinks = [copy.helpCenter, copy.contact, copy.privacy, copy.terms];

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
            {discoverLinks.map((link) => (
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
            {supportLinks.map((link) => (
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
