import type { Locale } from "@/lib/i18n/config";
import { siteName, siteOrigin } from "@/lib/seo/site";

type JsonLdObject = Record<string, unknown>;

/** Renders schema.org data; "<" is escaped so text can't close the script. */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

const absolute = (path: string) =>
  path.startsWith("http") ? path : `${siteOrigin()}${path}`;

export function organizationJsonLd(locale: Locale): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteOrigin()}/#organization`,
    name: siteName,
    alternateName: "Find Your Animal",
    url: absolute(`/${locale}`),
    logo: absolute("/media-kit/perfil.png"),
    description:
      locale === "pt"
        ? "Plataforma onde canis e associações publicam animais para adoção e gerem candidaturas, mensagens e visitas."
        : "Platform where shelters and rescue groups publish animals for adoption and manage applications, messages and visits.",
    // TODO(FYA): acrescentar "sameAs" com as páginas oficiais nas redes sociais e "email" de contacto quando existirem.
  };
}

export function websiteJsonLd(locale: Locale): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteOrigin()}/#website`,
    name: siteName,
    url: absolute(`/${locale}`),
    inLanguage: locale === "pt" ? "pt-PT" : "en",
    publisher: { "@id": `${siteOrigin()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absolute(`/${locale}/pets?q={search_term_string}`),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

type ShelterForJsonLd = {
  id: string;
  nome: string;
  localizacao: string;
  missao: string | null;
  telefone: string | null;
  email_contacto: string | null;
  image_url: string | null;
};

export function shelterJsonLd(
  shelter: ShelterForJsonLd,
  locale: Locale,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "AnimalShelter",
    "@id": absolute(`/${locale}/canis/${shelter.id}#shelter`),
    name: shelter.nome,
    url: absolute(`/${locale}/canis/${shelter.id}`),
    ...(shelter.missao ? { description: shelter.missao } : {}),
    ...(shelter.image_url ? { image: absolute(shelter.image_url) } : {}),
    ...(shelter.telefone ? { telephone: shelter.telefone } : {}),
    ...(shelter.email_contacto ? { email: shelter.email_contacto } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: shelter.localizacao,
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}
