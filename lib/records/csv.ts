export type ImportAnimal = {
  reference: string;
  name: string;
  species: string;
  breed: string;
  age: number | null;
  description: string;
};
export const CSV_TEMPLATE =
  "reference,name,species,breed,age,description\nFYA-001,Luna,cao,,2,Animal de exemplo";
export function parseAnimalCsv(text: string): ImportAnimal[] {
  if (text.length > 500000)
    throw new Error("CSV demasiado grande / CSV too large");
  text = text.replace(/^\uFEFF/, "");
  const delimiter = text.split(/\r?\n/)[0]?.includes(";") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (quoted || !field) {
        quoted = !quoted;
      } else throw new Error("Aspas inválidas / Invalid quotes");
    } else if (ch === delimiter && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (quoted) throw new Error("Aspas por fechar / Unclosed quote");
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  if (
    rows.shift()?.join(",") !== "reference,name,species,breed,age,description"
  )
    throw new Error(
      "Cabeçalho esperado / Expected header: reference,name,species,breed,age,description",
    );
  if (!rows.length || rows.length > 200)
    throw new Error("Usa entre 1 e 200 linhas / Use 1–200 rows");
  const seen = new Set<string>();
  return rows.map((r, i) => {
    const [reference, name, species, breed, age, description] = r;
    const fail = () => {
      throw new Error(
        `Linha / Row ${i + 2}: dados inválidos ou referência repetida / invalid data or duplicate reference`,
      );
    };
    if (
      r.length !== 6 ||
      !reference ||
      reference.length > 100 ||
      !name ||
      name.length > 160 ||
      !["cao", "gato", "outro"].includes(species) ||
      breed.length > 160 ||
      description.length > 4000 ||
      seen.has(reference) ||
      (age && !/^\d{1,2}$/.test(age))
    )
      fail();
    seen.add(reference);
    return {
      reference,
      name,
      species,
      breed,
      age: age ? Number(age) : null,
      description,
    };
  });
}
export function csvCell(value: unknown): string {
  let s = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
