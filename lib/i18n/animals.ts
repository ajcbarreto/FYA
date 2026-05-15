// Strings localizadas para taxonomia de animais (especie, porte, genero, estado).
// Usar destas funcoes em vez de espalhar `if (locale === "pt") ... else ...`.

type Locale = "pt" | "en";

function isPt(locale: string) {
  return locale === "pt";
}

export function speciesLabel(species: string, locale: string) {
  const n = species.toLowerCase();
  if (n === "cao") return isPt(locale) ? "Cao" : "Dog";
  if (n === "gato") return isPt(locale) ? "Gato" : "Cat";
  return species;
}

export function sexLabel(sex: string | null | undefined, locale: string) {
  if (!sex) return isPt(locale) ? "N/D" : "N/A";
  const n = sex.toLowerCase();
  if (n === "macho") return isPt(locale) ? "Macho" : "Male";
  if (n === "femea") return isPt(locale) ? "Femea" : "Female";
  return sex;
}

export function sizeLabel(size: string | null | undefined, locale: string) {
  if (!size) return isPt(locale) ? "Porte n/d" : "Size n/a";
  const n = size.toLowerCase();
  if (n === "pequeno") return isPt(locale) ? "Pequeno" : "Small";
  if (n === "medio") return isPt(locale) ? "Medio" : "Medium";
  if (n === "grande") return isPt(locale) ? "Grande" : "Large";
  return size;
}

export function statusLabel(status: string, locale: string) {
  const n = status.toLowerCase();
  if (n === "disponivel") return isPt(locale) ? "Disponivel" : "Available";
  if (n === "reservado") return isPt(locale) ? "Reservado" : "Reserved";
  if (n === "em_tratamento") return isPt(locale) ? "Em tratamento" : "In treatment";
  if (n === "adotado") return isPt(locale) ? "Adotado" : "Adopted";
  return status;
}

export function speciesOptions(locale: string) {
  return [
    { value: "", label: isPt(locale) ? "Todas as especies" : "All species" },
    { value: "cao", label: isPt(locale) ? "Caes" : "Dogs" },
    { value: "gato", label: isPt(locale) ? "Gatos" : "Cats" },
  ];
}

export function sexOptions(locale: string) {
  return [
    { value: "", label: isPt(locale) ? "Qualquer genero" : "Any gender" },
    { value: "macho", label: isPt(locale) ? "Macho" : "Male" },
    { value: "femea", label: isPt(locale) ? "Femea" : "Female" },
  ];
}

export function sizeOptions(locale: string) {
  return [
    { value: "", label: isPt(locale) ? "Qualquer porte" : "Any size" },
    { value: "pequeno", label: isPt(locale) ? "Pequeno" : "Small" },
    { value: "medio", label: isPt(locale) ? "Medio" : "Medium" },
    { value: "grande", label: isPt(locale) ? "Grande" : "Large" },
  ];
}

export function statusOptions(locale: string) {
  return [
    { value: "", label: isPt(locale) ? "Qualquer estado" : "Any status" },
    { value: "disponivel", label: isPt(locale) ? "Disponivel" : "Available" },
    { value: "reservado", label: isPt(locale) ? "Reservado" : "Reserved" },
    { value: "em_tratamento", label: isPt(locale) ? "Em tratamento" : "In treatment" },
    { value: "adotado", label: isPt(locale) ? "Adotado" : "Adopted" },
  ];
}

export type AnimalLocale = Locale;
