export function publicAnimalUrl(base: string, locale: string, id: string) {
  const url = new URL(base);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    !["pt", "en"].includes(locale) ||
    !/^[0-9a-f-]{36}$/i.test(id)
  )
    throw new Error("Invalid public URL");
  return new URL(`/${locale}/pets/${id}`, url.origin).toString();
}
