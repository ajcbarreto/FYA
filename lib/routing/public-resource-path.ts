type RecordTable = "animais" | "canis" | "support_projects";

export type PublicResource =
  | { kind: "guide"; slug: string }
  | {
      kind: "record";
      table: RecordTable;
      id: string;
      /** The support page only exists for verified shelters. */
      verifiedOnly?: boolean;
    };

/**
 * Public detail routes whose existence depends on a slug or a database row.
 * `segments` are the path segments after the locale.
 */
export function publicResourceFor(segments: string[]): PublicResource | null {
  const [section, key, sub, ...rest] = segments;
  if (!key || rest.length > 0) return null;
  if (section === "ajuda" && !sub) return { kind: "guide", slug: key };
  if (section === "pets" && (!sub || sub === "imprimir"))
    return { kind: "record", table: "animais", id: key };
  if (section === "canis" && !sub)
    return { kind: "record", table: "canis", id: key };
  if (section === "canis" && sub === "apoiar")
    return { kind: "record", table: "canis", id: key, verifiedOnly: true };
  if (section === "apoios" && !sub)
    return { kind: "record", table: "support_projects", id: key };
  return null;
}
