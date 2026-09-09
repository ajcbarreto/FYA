import { writeFile } from "node:fs/promises";
import { createTestDatabase } from "./test-database.mjs";
const db = await createTestDatabase();
try {
  const columns = (
    await db.query(
      "select table_name,column_name,udt_name,is_nullable,column_default,is_identity from information_schema.columns where table_schema='public' order by table_name,ordinal_position",
    )
  ).rows;
  const enums = (
    await db.query(
      "select t.typname,e.enumlabel from pg_type t join pg_enum e on e.enumtypid=t.oid join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' order by t.typname,e.enumsortorder",
    )
  ).rows;
  const enumMap = Object.groupBy(enums, (e) => e.typname);
  const types = (name) =>
    name.startsWith("_")
      ? `${types(name.slice(1))}[]`
      : enumMap[name]
        ? `Database["public"]["Enums"]["${name}"]`
        : ["int2", "int4", "int8", "float4", "float8", "numeric"].includes(name)
          ? "number"
          : name === "bool"
            ? "boolean"
            : ["json", "jsonb"].includes(name)
              ? "Json"
              : name === "void"
                ? "undefined"
                : "string";
  const relations = (
    await db.query(`select c.conname,s.relname source,t.relname target,
    array(select a.attname from unnest(c.conkey) with ordinality k(num,pos) join pg_attribute a on a.attrelid=s.oid and a.attnum=k.num order by k.pos) columns,
    array(select a.attname from unnest(c.confkey) with ordinality k(num,pos) join pg_attribute a on a.attrelid=t.oid and a.attnum=k.num order by k.pos) referenced
    from pg_constraint c join pg_class s on s.oid=c.conrelid join pg_class t on t.oid=c.confrelid join pg_namespace n on n.oid=s.relnamespace where c.contype='f' and n.nspname='public'`)
  ).rows;
  let source =
    "// Generated from versioned migrations by npm run db:types. Do not edit manually.\nexport type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\nexport type Database = { public: { Tables: {\n";
  for (const [table, fields] of Object.entries(
    Object.groupBy(columns, (c) => c.table_name),
  )) {
    source += `${JSON.stringify(table)}: {\n`;
    for (const kind of ["Row", "Insert", "Update"]) {
      source += `${kind}: {\n`;
      for (const f of fields) {
        const optional =
          kind === "Update" ||
          (kind === "Insert" &&
            (f.is_nullable === "YES" ||
              f.column_default ||
              f.is_identity === "YES"));
        source += `${JSON.stringify(f.column_name)}${optional ? "?" : ""}: ${types(f.udt_name)}${f.is_nullable === "YES" ? " | null" : ""};\n`;
      }
      source += "};\n";
    }
    source +=
      "Relationships: [" +
      relations
        .filter((r) => r.source === table)
        .map(
          (r) =>
            `{ foreignKeyName: ${JSON.stringify(r.conname)}; columns: ${JSON.stringify(r.columns)}; isOneToOne: false; referencedRelation: ${JSON.stringify(r.target)}; referencedColumns: ${JSON.stringify(r.referenced)}; }`,
        )
        .join(",") +
      "];\n};\n";
  }
  source += "}; Views: Record<string, never>; Functions: {\n";
  const functions = (
    await db.query(
      `select p.proname,p.proargnames,t.typname result,p.proretset,array(select a.typname from unnest(p.proargtypes) with ordinality k(num,pos) join pg_type a on a.oid=k.num order by k.pos) args from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_type t on t.oid=p.prorettype where n.nspname='public' and t.typname<>'trigger'`,
    )
  ).rows;
  for (const f of functions) {
    const args = (f.proargnames ?? [])
      .map((n, i) => `${JSON.stringify(n)}: ${types(f.args[i])}`)
      .join(";");
    const result = columns.some((c) => c.table_name === f.result)
      ? `Database["public"]["Tables"]["${f.result}"]["Row"]`
      : types(f.result);
    source += `${JSON.stringify(f.proname)}: { Args: ${args ? `{${args}}` : "Record<string, never>"}; Returns: ${result}${f.proretset ? "[]" : ""} };\n`;
  }
  source +=
    "}; Enums: {" +
    Object.entries(enumMap)
      .map(
        ([n, values]) =>
          `${JSON.stringify(n)}: ${values.map((v) => JSON.stringify(v.enumlabel)).join(" | ")}`,
      )
      .join(";") +
    "}; CompositeTypes: Record<string,never>; }; };\n";
  await writeFile(
    new URL("../lib/supabase/database.types.ts", import.meta.url),
    source,
  );
} finally {
  await db.close();
}
