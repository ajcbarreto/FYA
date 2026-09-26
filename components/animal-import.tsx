"use client";
import { useState } from "react";
import { CSV_TEMPLATE, parseAnimalCsv } from "@/lib/records/csv";
import { importAnimals } from "@/app/records/import-actions";
import { SubmitButton } from "@/components/submit-button";
export function AnimalImport({ locale }: { locale: string }) {
  const [csv, setCsv] = useState(""),
    pt = locale === "pt";
  let rows: ReturnType<typeof parseAnimalCsv> = [],
    error = "";
  try {
    if (csv) rows = parseAnimalCsv(csv);
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <form action={importAnimals} className="space-y-4">
      <input name="locale" value={locale} type="hidden" />
      <label className="block">
        {pt
          ? "Carregar CSV (até 200 animais)"
          : "Upload CSV (up to 200 animals)"}
        <input
          type="file"
          accept=".csv,text/csv"
          className="block mt-2"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 500000) {
                setCsv("Ficheiro demasiado grande / File too large");
                return;
              }
              setCsv(await file.text());
            }
          }}
        />
      </label>
      <label className="block">
        CSV
        <textarea
          className="mt-2 block w-full rounded-xl border border-border bg-background p-3 font-mono text-sm"
          name="csv"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={7}
          placeholder={CSV_TEMPLATE}
        />
      </label>
      <p>
        {pt
          ? "Importação atómica: uma referência repetida no canil rejeita todo o lote. Os animais entram como registos internos, sem publicação automática."
          : "Atomic import: an existing reference in this shelter rejects the whole batch. Animals are imported as internal records, without automatic publication."}
      </p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {rows.length > 0 && (
        <div className="overflow-auto">
          <table className="w-full text-left">
            <caption>
              {rows.length}{" "}
              {pt ? "animais prontos para importar" : "animals ready to import"}
            </caption>
            <thead>
              <tr>
                <th>{pt ? "Referência" : "Reference"}</th>
                <th>{pt ? "Nome" : "Name"}</th>
                <th>{pt ? "Espécie" : "Species"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.reference}>
                  <td>{r.reference}</td>
                  <td>{r.name}</td>
                  <td>{r.species}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <SubmitButton
        disabled={!rows.length || !!error}
        className="rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground"
      >
        {pt ? "Confirmar importação" : "Confirm import"}
      </SubmitButton>
    </form>
  );
}
