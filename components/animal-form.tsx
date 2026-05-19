import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
  const t = getDictionary(locale as Locale).animalForm;
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
            <option value="cao">{t.speciesDog}</option>
            <option value="gato">{t.speciesCat}</option>
            <option value="outro">{t.speciesOther}</option>
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
            <option value="macho">{t.sexMale}</option>
            <option value="femea">{t.sexFemale}</option>
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
            <option value="pequeno">{t.sizeSmall}</option>
            <option value="medio">{t.sizeMedium}</option>
            <option value="grande">{t.sizeLarge}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-semibold">
            {t.status}
          </label>
          <select id="status" name="status" defaultValue={values?.status ?? "disponivel"} required className={inputClass}>
            <option value="disponivel">{t.statusAvailable}</option>
            <option value="reservado">{t.statusReserved}</option>
            <option value="em_tratamento">{t.statusInTreatment}</option>
            <option value="adotado">{t.statusAdopted}</option>
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
