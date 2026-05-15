type AnimalFormValues = {
  nome?: string;
  especie?: string;
  raca?: string | null;
  sexo?: string | null;
  idade_anos?: number | null;
  porte?: string | null;
  status?: string;
  descricao?: string | null;
};

type AnimalFormProps = {
  locale: string;
  action: (formData: FormData) => void | Promise<void>;
  animalId?: string;
  values?: AnimalFormValues;
  submitLabel: string;
};

export function AnimalForm({ locale, action, animalId, values, submitLabel }: AnimalFormProps) {
  const isPt = locale === "pt";
  const t = {
    name: isPt ? "Nome" : "Name",
    species: isPt ? "Especie" : "Species",
    breed: isPt ? "Raca" : "Breed",
    sex: isPt ? "Genero" : "Gender",
    age: isPt ? "Idade (anos)" : "Age (years)",
    size: isPt ? "Porte" : "Size",
    status: isPt ? "Estado" : "Status",
    description: isPt ? "Descricao" : "Description",
    select: isPt ? "Seleciona..." : "Select...",
    species_cao: isPt ? "Cao" : "Dog",
    species_gato: isPt ? "Gato" : "Cat",
    species_outro: isPt ? "Outro" : "Other",
    sex_macho: isPt ? "Macho" : "Male",
    sex_femea: isPt ? "Femea" : "Female",
    size_pequeno: isPt ? "Pequeno" : "Small",
    size_medio: isPt ? "Medio" : "Medium",
    size_grande: isPt ? "Grande" : "Large",
    status_disponivel: isPt ? "Disponivel" : "Available",
    status_reservado: isPt ? "Reservado" : "Reserved",
    status_em_tratamento: isPt ? "Em tratamento" : "In treatment",
    status_adotado: isPt ? "Adotado" : "Adopted",
  };
  const inputClass =
    "h-11 w-full rounded-xl border border-border/25 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {animalId && <input type="hidden" name="animalId" value={animalId} />}

      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-semibold">
          {t.name}
        </label>
        <input id="nome" name="nome" defaultValue={values?.nome ?? ""} required className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="especie" className="text-sm font-semibold">
            {t.species}
          </label>
          <select id="especie" name="especie" defaultValue={values?.especie ?? ""} required className={inputClass}>
            <option value="">{t.select}</option>
            <option value="cao">{t.species_cao}</option>
            <option value="gato">{t.species_gato}</option>
            <option value="outro">{t.species_outro}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="raca" className="text-sm font-semibold">
            {t.breed}
          </label>
          <input id="raca" name="raca" defaultValue={values?.raca ?? ""} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label htmlFor="sexo" className="text-sm font-semibold">
            {t.sex}
          </label>
          <select id="sexo" name="sexo" defaultValue={values?.sexo ?? ""} className={inputClass}>
            <option value="">{t.select}</option>
            <option value="macho">{t.sex_macho}</option>
            <option value="femea">{t.sex_femea}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="idade_anos" className="text-sm font-semibold">
            {t.age}
          </label>
          <input
            id="idade_anos"
            name="idade_anos"
            type="number"
            min={0}
            max={40}
            defaultValue={values?.idade_anos ?? ""}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="porte" className="text-sm font-semibold">
            {t.size}
          </label>
          <select id="porte" name="porte" defaultValue={values?.porte ?? ""} className={inputClass}>
            <option value="">{t.select}</option>
            <option value="pequeno">{t.size_pequeno}</option>
            <option value="medio">{t.size_medio}</option>
            <option value="grande">{t.size_grande}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-semibold">
            {t.status}
          </label>
          <select id="status" name="status" defaultValue={values?.status ?? "disponivel"} required className={inputClass}>
            <option value="disponivel">{t.status_disponivel}</option>
            <option value="reservado">{t.status_reservado}</option>
            <option value="em_tratamento">{t.status_em_tratamento}</option>
            <option value="adotado">{t.status_adotado}</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="descricao" className="text-sm font-semibold">
          {t.description}
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={4}
          defaultValue={values?.descricao ?? ""}
          className="w-full rounded-xl border border-border/25 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
        {submitLabel}
      </button>
    </form>
  );
}
