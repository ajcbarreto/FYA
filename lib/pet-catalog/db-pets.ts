import type { SupabaseClient } from "@supabase/supabase-js";

export type PetCatalogItem = {
  id: string;
  name: string;
  age: string;
  species: string;
  sex: string;
  traits: string[];
  badge?: "new" | "urgent";
  location: string;
  shelterName: string;
  description: string;
  status: string;
  imageUrl: string;
};

export type AnimalRow = {
  id: string;
  canil_id: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: string | null;
  idade_anos: number | null;
  porte: string | null;
  status: string;
  descricao: string | null;
  canis: { nome: string; localizacao: string } | { nome: string; localizacao: string }[] | null;
};

type CatalogPetsQueryOptions = {
  search?: string;
  limit?: number;
  page?: number;
  species?: string;
  sex?: string;
  size?: string;
  status?: string;
};

function toTitleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapAgeLabel(ageYears: number | null, locale: string) {
  if (ageYears === null || Number.isNaN(ageYears)) {
    return locale === "pt" ? "Idade n/d" : "Age n/a";
  }

  if (locale === "pt") {
    return `${ageYears} ${ageYears === 1 ? "ano" : "anos"}`;
  }

  return `${ageYears} ${ageYears === 1 ? "year" : "years"}`;
}

function mapStatusLabel(status: string, locale: string) {
  const normalized = status.toLowerCase();
  if (locale === "pt") {
    if (normalized === "disponivel") return "Disponivel";
    if (normalized === "reservado") return "Reservado";
    if (normalized === "em_tratamento") return "Em tratamento";
    if (normalized === "adotado") return "Adotado";
    return toTitleCase(status);
  }

  if (normalized === "disponivel") return "Available";
  if (normalized === "reservado") return "Reserved";
  if (normalized === "em_tratamento") return "In treatment";
  if (normalized === "adotado") return "Adopted";
  return toTitleCase(status);
}

function mapSpeciesLabel(species: string, locale: string) {
  const normalized = species.toLowerCase();
  if (locale === "pt") {
    if (normalized === "cao") return "Cao";
    if (normalized === "gato") return "Gato";
    return toTitleCase(species);
  }

  if (normalized === "cao") return "Dog";
  if (normalized === "gato") return "Cat";
  return toTitleCase(species);
}

function mapSexLabel(sex: string | null, locale: string) {
  if (!sex) {
    return locale === "pt" ? "N/D" : "N/A";
  }

  const normalized = sex.toLowerCase();
  if (locale === "pt") {
    if (normalized === "macho") return "Macho";
    if (normalized === "femea") return "Femea";
    return toTitleCase(sex);
  }

  if (normalized === "macho") return "Male";
  if (normalized === "femea") return "Female";
  return toTitleCase(sex);
}

function mapSizeTrait(size: string | null, locale: string) {
  if (!size) {
    return locale === "pt" ? "Porte n/d" : "Size n/a";
  }

  const normalized = size.toLowerCase();
  if (locale === "pt") {
    if (normalized === "pequeno") return "Porte pequeno";
    if (normalized === "medio") return "Porte medio";
    if (normalized === "grande") return "Porte grande";
    return toTitleCase(size);
  }

  if (normalized === "pequeno") return "Small size";
  if (normalized === "medio") return "Medium size";
  if (normalized === "grande") return "Large size";
  return toTitleCase(size);
}

function badgeForStatus(status: string): "new" | "urgent" | undefined {
  const normalized = status.toLowerCase();
  if (normalized === "disponivel") return "new";
  if (normalized === "em_tratamento") return "urgent";
  return undefined;
}

function imageForAnimal(animal: AnimalRow) {
  const dogImages = [
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=900&q=80",
  ];
  const catImages = [
    "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?auto=format&fit=crop&w=900&q=80",
  ];
  const genericImages = [
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80",
  ];

  const species = animal.especie.toLowerCase();
  const source = species === "cao" ? dogImages : species === "gato" ? catImages : genericImages;
  const seed = Array.from(animal.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return source[seed % source.length];
}

function extractShelter(canis: AnimalRow["canis"]) {
  if (!canis) return null;
  return Array.isArray(canis) ? canis[0] ?? null : canis;
}

export function toCatalogItem(animal: AnimalRow, locale: string): PetCatalogItem {
  const shelter = extractShelter(animal.canis);
  const speciesLabel = mapSpeciesLabel(animal.especie, locale);
  const breed = animal.raca ? toTitleCase(animal.raca) : speciesLabel;
  const sex = mapSexLabel(animal.sexo, locale);
  const status = mapStatusLabel(animal.status, locale);

  return {
    id: animal.id,
    name: animal.nome,
    age: mapAgeLabel(animal.idade_anos, locale),
    species: breed,
    sex,
    traits: [mapSizeTrait(animal.porte, locale), status],
    badge: badgeForStatus(animal.status),
    location: shelter?.localizacao ?? (locale === "pt" ? "Localizacao n/d" : "Location n/a"),
    shelterName: shelter?.nome ?? (locale === "pt" ? "Abrigo n/d" : "Shelter n/a"),
    description: animal.descricao ?? "",
    status,
    imageUrl: imageForAnimal(animal),
  };
}

export async function getCatalogPets(supabase: SupabaseClient, locale: string, options: CatalogPetsQueryOptions = {}) {
  let query = supabase
    .from("animais")
    .select("id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis(nome,localizacao)")
    .order("created_at", { ascending: false });

  const normalizedSearch = options.search?.trim();
  if (normalizedSearch) {
    const escaped = normalizedSearch.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(`nome.ilike.%${escaped}%,raca.ilike.%${escaped}%,descricao.ilike.%${escaped}%`);
  }
  if (options.species) {
    query = query.eq("especie", options.species);
  }
  if (options.sex) {
    query = query.eq("sexo", options.sex);
  }
  if (options.size) {
    query = query.eq("porte", options.size);
  }
  if (options.status) {
    query = query.eq("status", options.status);
  }
  if (options.limit && options.limit > 0) {
    const page = Math.max(1, options.page ?? 1);
    const from = (page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error || !data) {
    if (error) {
      console.error("[getCatalogPets] Supabase error:", error.message);
    }
    return [];
  }

  return (data as AnimalRow[]).map((animal) => toCatalogItem(animal, locale));
}

export async function getCatalogPetsCount(
  supabase: SupabaseClient,
  options: Pick<CatalogPetsQueryOptions, "search" | "species" | "sex" | "size" | "status"> = {},
) {
  let query = supabase.from("animais").select("id", { count: "exact", head: true });
  const normalizedSearch = options.search?.trim();
  if (normalizedSearch) {
    const escaped = normalizedSearch.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(`nome.ilike.%${escaped}%,raca.ilike.%${escaped}%,descricao.ilike.%${escaped}%`);
  }
  if (options.species) {
    query = query.eq("especie", options.species);
  }
  if (options.sex) {
    query = query.eq("sexo", options.sex);
  }
  if (options.size) {
    query = query.eq("porte", options.size);
  }
  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { count, error } = await query;
  if (error) {
    console.error("[getCatalogPetsCount] Supabase error:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getPetById(supabase: SupabaseClient, petId: string, locale: string) {
  const { data, error } = await supabase
    .from("animais")
    .select("id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis(nome,localizacao)")
    .eq("id", petId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("[getPetById] Supabase error:", error.message);
    }
    return null;
  }

  return toCatalogItem(data as AnimalRow, locale);
}

export async function getRelatedPets(supabase: SupabaseClient, petId: string, locale: string, limit = 3) {
  const { data: current } = await supabase.from("animais").select("canil_id").eq("id", petId).maybeSingle();
  const currentCanilId = current?.canil_id ?? null;

  const baseQuery = supabase
    .from("animais")
    .select("id,canil_id,nome,especie,raca,sexo,idade_anos,porte,status,descricao,canis(nome,localizacao)")
    .neq("id", petId)
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error } = currentCanilId
    ? await baseQuery.eq("canil_id", currentCanilId)
    : await baseQuery;

  if (error || !data) {
    if (error) {
      console.error("[getRelatedPets] Supabase error:", error.message);
    }
    return [];
  }

  return (data as AnimalRow[]).map((animal) => toCatalogItem(animal, locale));
}
