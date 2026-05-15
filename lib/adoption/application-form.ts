export type AdoptionApplicationAnswers = {
  housing_type?: string;
  has_garden?: boolean;
  household_size?: string;
  has_children?: boolean;
  has_other_pets?: boolean;
  other_pets_detail?: string;
  experience?: string;
  hours_alone?: string;
  reason?: string;
  message?: string;
};

export const housingOptions = ["apartment", "house", "shared", "other"] as const;
export const householdSizeOptions = ["1", "2", "3", "4+"] as const;
export const hoursAloneOptions = ["0-2", "3-5", "6-8", "8+"] as const;
export const experienceOptions = ["none", "some", "experienced"] as const;

export function parseApplicationAnswers(formData: FormData): AdoptionApplicationAnswers {
  const get = (name: string) => {
    const value = formData.get(name);
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };
  const getBool = (name: string) => {
    const value = formData.get(name);
    if (value === "true" || value === "on" || value === "yes") return true;
    if (value === "false" || value === "no") return false;
    return undefined;
  };

  return {
    housing_type: get("housing_type"),
    has_garden: getBool("has_garden"),
    household_size: get("household_size"),
    has_children: getBool("has_children"),
    has_other_pets: getBool("has_other_pets"),
    other_pets_detail: get("other_pets_detail"),
    experience: get("experience"),
    hours_alone: get("hours_alone"),
    reason: get("reason"),
    message: get("message"),
  };
}

export function localizeAnswerKey(key: keyof AdoptionApplicationAnswers, locale: string) {
  const dict: Record<keyof AdoptionApplicationAnswers, { pt: string; en: string }> = {
    housing_type: { pt: "Tipo de habitacao", en: "Housing type" },
    has_garden: { pt: "Tem quintal/jardim", en: "Has garden" },
    household_size: { pt: "Pessoas em casa", en: "Household size" },
    has_children: { pt: "Tem criancas", en: "Has children" },
    has_other_pets: { pt: "Tem outros animais", en: "Has other pets" },
    other_pets_detail: { pt: "Detalhes outros animais", en: "Other pets details" },
    experience: { pt: "Experiencia com animais", en: "Pet experience" },
    hours_alone: { pt: "Horas sozinho/dia", en: "Hours alone per day" },
    reason: { pt: "Motivo para adotar", en: "Reason to adopt" },
    message: { pt: "Mensagem ao canil", en: "Message to shelter" },
  };
  return dict[key][locale === "pt" ? "pt" : "en"];
}

export function localizeAnswerValue(
  key: keyof AdoptionApplicationAnswers,
  value: unknown,
  locale: string,
) {
  if (typeof value === "boolean") {
    if (locale === "pt") return value ? "Sim" : "Nao";
    return value ? "Yes" : "No";
  }
  if (typeof value !== "string" || value.length === 0) {
    return locale === "pt" ? "Nao respondido" : "Not answered";
  }
  const labels: Partial<Record<keyof AdoptionApplicationAnswers, Record<string, { pt: string; en: string }>>> = {
    housing_type: {
      apartment: { pt: "Apartamento", en: "Apartment" },
      house: { pt: "Casa", en: "House" },
      shared: { pt: "Casa partilhada", en: "Shared home" },
      other: { pt: "Outro", en: "Other" },
    },
    experience: {
      none: { pt: "Sem experiencia", en: "None" },
      some: { pt: "Alguma experiencia", en: "Some" },
      experienced: { pt: "Muita experiencia", en: "Experienced" },
    },
  };
  const map = labels[key];
  if (map && map[value]) {
    return map[value][locale === "pt" ? "pt" : "en"];
  }
  return value;
}
