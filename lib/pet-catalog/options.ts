// Canonical values are stored in PostgreSQL. Legacy English labels remain accepted in settings.
const definitions = {
  species: [
    ["cao", "Cães", "Dogs", "Dog"],
    ["gato", "Gatos", "Cats", "Cat"],
    ["outro", "Outros", "Other", "Other"],
  ],
  sizes: [
    ["pequeno", "Pequeno", "Small", "Small"],
    ["medio", "Médio", "Medium", "Medium"],
    ["grande", "Grande", "Large", "Large"],
  ],
  genders: [
    ["macho", "Macho", "Male", "Male"],
    ["femea", "Fêmea", "Female", "Female"],
  ],
  ageRanges: [
    ["baby", "Menos de 1 ano", "Under 1 year", "Baby (0-1)"],
    ["young", "1 a 2 anos", "1–2 years", "Young (1-3)"],
    ["adult", "3 a 6 anos", "3–6 years", "Adult (3-7)"],
    ["senior", "7 ou mais anos", "7+ years", "Senior (7+)"],
  ],
  compatibilities: [
    ["children", "Com crianças", "With children", "Kid Friendly"],
    ["seniors", "Com seniores", "With seniors", "Senior Friendly"],
    ["apartment", "Apartamento", "Apartment", "Apartment Life"],
    ["trained", "Treinado", "Trained", "Well Trained"],
  ],
} as const;
export function configuredOptions(
  key: keyof typeof definitions,
  configured: string[],
  locale: string,
) {
  return definitions[key]
    .filter((d) =>
      configured.some((v) =>
        [d[0], d[1], d[2], d[3]].some(
          (alias) => alias.toLowerCase() === v.toLowerCase(),
        ),
      ),
    )
    .map((d) => ({ value: d[0], label: locale === "pt" ? d[1] : d[2] }));
}
export function validFilterConfig(
  key: keyof typeof definitions,
  values: string[],
) {
  return (
    values.length > 0 &&
    values.every((value) =>
      definitions[key].some((d) =>
        d.some((alias) => alias.toLowerCase() === value.toLowerCase()),
      ),
    )
  );
}
